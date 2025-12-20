// modify the tool execution loop in the run method to detect and handle handoff tool calls differently from regular tools

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

  private buildRequestArgs(messages: Anthropic.MessageParam[]): Anthropic.Messages.MessageCreateParams {
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

  private async callHandoff(toolUse: Anthropic.ToolUseBlock, messages: Anthropic.MessageParam[]): Promise<[boolean, any]> {
    // Extract the agent name from the handoff tool input
    const agentName = (toolUse.input as any)?.name;
    const reason = (toolUse.input as any)?.reason || "No reason provided";
    
    console.log(`🔄 Handoff to: ${agentName}`);
    console.log(`📝 Reason: ${reason}`);
    
    try {
      // Find the agent with the given name (throws error if not found)
      const targetAgent = this.handoffs.find(agent => agent.name === agentName);
      if (!targetAgent) {
        throw new Error(`Agent '${agentName}' not found`);
      }
      
      // Remove the last assistant message that contains the handoff tool_use
      const cleanMessages = messages.length > 0 && messages[messages.length - 1].role === "assistant"
        ? messages.slice(0, -1)
        : messages;
      
      // Handoff the control to the other agent
      return [true, await targetAgent.run(cleanMessages)];
      
    } catch (error: any) {
      // Agent not found or any other error
      return [false, {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: `Handoff failed: ${error.message}. Available agents: ${JSON.stringify(this.handoffs.map(agent => agent.name))}`
      }];
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
            // TODO: Check if this is a handoff tool call (contentItem.name === "handoff")
            // TODO: If it's a handoff, call this.callHandoff(contentItem, messages)
            // TODO: Store the result as: [handoffSuccess, handoffResult]
            // TODO: If handoffSuccess is true, immediately return handoffResult
            // TODO: If handoffSuccess is false, append handoffResult to toolResults
            if (contentItem.name === "handoff"){
              const [handoffSuccess, handoffResult] = await this.callHandoff(contentItem, messages);
              if (handoffSuccess) {
                return handoffResult;
              }
              else{
                toolResults.push(handoffResult);
              }
            } else{
              // Execute regular tools
              const toolResult = await this.callTool(contentItem);
              // Add result to tool results list
              toolResults.push(toolResult);              
            }
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