// implement the mechanism that finds target agents, cleans conversation context, and executes the control transfer

import Anthropic from "@anthropic-ai/sdk";

export interface AgentOptions {
  name: string;
  systemPrompt?: string;
  model?: string;
  tools?: Record<string, Function>;
  toolSchemas?: Anthropic.Tool[];
  handoffs?: Agent[];
  maxTurns?: number;
}

export class Agent {
  private static BASE_SYSTEM_PROMPT = 
    "You are an autonomous agent that can take multiple tool-calling steps when helpful. " +
    "The user only sees your response when you stop using tools, not your tool usage or reasoning steps. " +
    "When you provide your answer without calling tools, make it complete and standalone.\n" +
    "Additional instructions:\n";

  private client: Anthropic;
  public name: string;
  private model: string;
  private systemPrompt: string;
  private maxTurns: number;
  private tools: Record<string, Function>;
  private toolSchemas: Anthropic.Tool[];
  private handoffs: Agent[];
  private handoffSchema: Anthropic.Tool;

  constructor({
    name,
    systemPrompt = "You are a helpful assistant.",
    model = "claude-sonnet-4-20250514",
    tools = {},
    toolSchemas = [],
    handoffs = [],
    maxTurns = 10,
  }: AgentOptions) {
    this.client = new Anthropic();
    this.name = name;
    this.model = model;
    this.systemPrompt = Agent.BASE_SYSTEM_PROMPT + systemPrompt;
    this.maxTurns = maxTurns;

    // Avoid shared mutable defaults and protect against external mutation
    this.tools = { ...tools };
    this.toolSchemas = [...toolSchemas];
    this.handoffs = [...handoffs];

    // Define handoff tool schema
    this.handoffSchema = {
      name: "handoff",
      description: "Transfer control to another specialized agent. Use this when the user's request is better handled by a different agent.",
      input_schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: `Name of the agent to handoff to. Available agents: ${JSON.stringify(this.handoffs.map(agent => agent.name))}`
          },
          reason: {
            type: "string",
            description: "Brief explanation of why this handoff is needed"
          }
        },
        required: ["name", "reason"]
      }
    };
  }

  private extractText(content: Anthropic.ContentBlock[]): string {
    return content
      .filter(block => block.type === "text")
      .map(block => (block as Anthropic.TextBlock).text)
      .join("");
  }

  public buildRequestArgs(messages: Anthropic.MessageParam[]): Anthropic.Messages.MessageCreateParams {
    const requestArgs: Anthropic.Messages.MessageCreateParams = {
      model: this.model,
      system: this.systemPrompt,
      messages: messages,
      max_tokens: 8000,
    };

    // Build the complete tool schemas list
    const allTools: Anthropic.Tool[] = [];
    
    // Add regular tool schemas if they exist
    if (this.toolSchemas.length > 0) {
      allTools.push(...this.toolSchemas);
    }
    
    // Add handoff schema if handoffs are available
    if (this.handoffs.length > 0) {
      allTools.push(this.handoffSchema);
    }
    
    // Add tools to request if any exist
    if (allTools.length > 0) {
      requestArgs.tools = allTools;
    }

    return requestArgs;
  }

  private async callTool(toolUse: Anthropic.ToolUseBlock): Promise<Anthropic.ToolResultBlockParam> {
    const toolName = toolUse.name;
    const toolInput = toolUse.input || {};
    const toolUseId = toolUse.id;

    console.log(`🔧 Tool called: ${toolName}(${JSON.stringify(toolInput)})`);
    
    let result: string;
    try {
      if (!(toolName in this.tools)) {
        result = `Error: Tool ${toolName} not found`;
      } else {
        const toolResult = await this.tools[toolName](...Object.values(toolInput));
        result = String(toolResult);
      }
    } catch (error: any) {
      result = `Error: ${error.message}`;
    }

    return {
      type: "tool_result",
      tool_use_id: toolUseId,
      content: result
    };
  }

  public async callHandoff(toolUse: Anthropic.ToolUseBlock, messages: Anthropic.MessageParam[]): Promise<[boolean, any]> {
    // TODO: Extract the agent name from toolUse.input using optional chaining (as any)?.name
    // TODO: Extract the reason from toolUse.input using optional chaining with default "No reason provided"
    // TODO: Print a debug message with the target agent name and handoff reason
    const agentName = (toolUse.input as any)?.name;
    const reason = (toolUse.input as any)?.reason || "No reason provided";
    
    console.log(`Handoff requested to agent: ${agentName}`);
    console.log(`Handoff reason: ${reason}`);
    
    // TODO: Start a try-catch block to handle potential errors
      // TODO: Use find() to locate the target agent in this.handoffs where agent.name matches agentName
      // TODO: If targetAgent is not found, throw an Error with message "Agent '{agentName}' not found"
      // TODO: Clean the messages by removing the last assistant message if it exists
      // Hint: Use conditional expression: messages.length > 0 && messages[messages.length - 1].role === "assistant" ? messages.slice(0, -1) : messages
      // TODO: Call targetAgent.run(cleanMessages) with await and return a tuple: [true, result]
      try {
        const targetAgent = this.handoffs.find(agent => agent.name === agentName);
        
        if (!targetAgent){
          throw new Error(`Agent '${agentName}' not found`);
        }
        
        const cleanMessages = 
        messages.length > 0 && messages[messages.length - 1].role === "assistant"
        ? messages.slice(0, -1)
        : messages;
        
        const result = await targetAgent.run(cleanMessages);
        
        return [true, result];
      }
      
    // TODO: Add catch (error: any) block to catch errors
      // TODO: Return [false, toolResultDict] with type "tool_result", tool_use_id, and error content message
        catch (error: any) {
          const toolResultDict: Anthropic.ToolResultBlockParam = {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content:
            `Handoff failed: ${error?.message || String(error)}. ` +
            `Available agents: ${JSON.stringify(this.handoffs.map(a => a.name))}`
          };
          
          return [false, toolResultDict];
        }      
  }

  public async run(inputMessages: Anthropic.MessageParam[]): Promise<[Anthropic.MessageParam[], string]> {
    // Create a copy of the input messages to avoid modifying the original
    const messages = [...inputMessages];

    // Loop until the model returns a final answer or the max turns is reached
    let turn = 0;
    while (turn < this.maxTurns) {
      turn++;

      const response = await this.client.messages.create(this.buildRequestArgs(messages));

      messages.push({ role: "assistant", content: response.content });

      // Execute all tools if Claude requests any
      if (response.stop_reason === "tool_use") {
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const contentItem of response.content) {
          if (contentItem.type === "tool_use") {
            const toolResult = await this.callTool(contentItem);
            toolResults.push(toolResult);
          }
        }

        // Add all tool results to messages
        messages.push({
          role: "user",
          content: toolResults
        });
    
      } else {
        // Return if no tools are requested
        const responseText = this.extractText(response.content);

        return [messages, responseText];
      }
    }

    // If the max turns is reached, raise an exception
    throw new Error("Max turns reached");
  }
}