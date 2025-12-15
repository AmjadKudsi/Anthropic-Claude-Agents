// build a simplified version of the run method in agent.ts that handles basic conversation flow, focusing on the fundamental request-response cycle that forms the backbone of all agent interactions

import Anthropic from "@anthropic-ai/sdk";

export interface AgentOptions {
  name: string;
  systemPrompt?: string;
  model?: string;
  tools?: Record<string, Function>;
  toolSchemas?: Anthropic.Tool[];
  maxTurns?: number;
}

export class Agent {
  // Base system prompt to be used for all agents
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

  constructor({
    name,
    systemPrompt = "You are a helpful assistant.",
    model = "claude-sonnet-4-20250514",
    tools = {},
    toolSchemas = [],
    maxTurns = 10,
  }: AgentOptions) {
    this.client = new Anthropic();
    this.name = name;
    this.model = model;
    this.systemPrompt = Agent.BASE_SYSTEM_PROMPT + systemPrompt;
    this.maxTurns = maxTurns;

    // Copy to isolate from external mutation
    this.tools = { ...tools };
    this.toolSchemas = [...toolSchemas];
  }

  // TODO: Implement the extractText helper method that takes content blocks and returns joined text
    // TODO: Filter content blocks to only text type blocks and join their text
  private extractText(content: Anthropic.ContentBlock[]): string {
    
    return content
      .filter(block => block.type === "text")
      .map(block => (block as Anthropic.TextBlock).text)
      .join("");
  }    

  // TODO: Implement the buildRequestArgs helper method that takes messages and returns request parameters
    // TODO: Create an object with model, system prompt, messages, and max_tokens
    // TODO: Add tool schemas only if they exist
    // TODO: Return the complete set of arguments to use for the API call
  private buildRequestArgs(messages: Anthropic.MessageParam[]): Anthropic.Messages.MessageCreateParams {
    
    const requestArgs: Anthropic.Messages.MessageCreateParams = {
      model: this.model,
      system: this.systemPrompt,
      messages: messages,
      max_tokens: 8000,
    };    
    
    if (this.toolSchemas.length > 0) {
      requestArgs.tools = this.toolSchemas;
    }    
      return requestArgs;
  }

  private callTool(toolUse: Anthropic.ToolUseBlock): Anthropic.ToolResultBlockParam {
    // Get the tool name, input, and id
    const toolName = toolUse.name;
    const toolInput = toolUse.input || {};
    const toolUseId = toolUse.id;

    // Display which tool is being called
    console.log(`🔧 Tool called: ${toolName}(${JSON.stringify(toolInput)})`);
    
    let result: string;
    try {
      if (!(toolName in this.tools)) {
        // Return an error message if the tool is not found
        result = `Error: Tool ${toolName} not found`;
      } else {
        // Execute the tool with the given input
        const toolResult = this.tools[toolName](...Object.values(toolInput));
        result = String(toolResult);
      }
    } catch (error: any) {
      // Return an error message if the tool fails
      result = `Error: ${error.message}`;
    }

    // Return the tool result
    return {
      type: "tool_result",
      tool_use_id: toolUseId,
      content: result
    };
  }

  // TODO: Implement the run method that takes a list of conversation messages
    // TODO: Create a copy of the input messages to avoid modifying the original
    // TODO: Make an API call to Claude using this.client.messages.create() with the buildRequestArgs helper
    // TODO: Append Claude's response to messages with role "assistant" and content from response.content
    // TODO: Extract the response text using the extractText helper method
    // TODO: Return both the updated messages and the extracted response text
  public async run(
    inputMessages: Anthropic.MessageParam[]
  ): Promise<{ messages: Anthropic.MessageParam[]; responseText: string }> {
    
    const messages: Anthropic.MessageParam[] = [...inputMessages];

    let lastAssistantText = "";

    for (let turn = 0; turn < this.maxTurns; turn++) {
  
      const response = await this.client.messages.create(
        this.buildRequestArgs(messages)
      );

      messages.push({
        role: "assistant",
        content: response.content,
      });

      lastAssistantText = this.extractText(response.content);

      if (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter(
          (b) => b.type === "tool_use"
        ) as Anthropic.ToolUseBlock[];

        const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map(
          (toolUse) => this.callTool(toolUse)
        );

        messages.push({
          role: "user",
          content: toolResults,
        });

        continue;
      }
      break;
    }

    return { messages, responseText: lastAssistantText };
  }     
    
}