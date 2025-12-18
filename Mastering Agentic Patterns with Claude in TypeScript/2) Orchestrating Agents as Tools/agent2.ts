// make agents callable as tools by updating the Agent class to support asynchronous operations and building a complete wrapper function

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

    if (this.toolSchemas.length > 0) {
      requestArgs.tools = this.toolSchemas;
    }

    return requestArgs;
  }

  // TODO: Update this method to support async tools by:
  // 1. Making it an async method
  // 2. Changing the return type to Promise<Anthropic.ToolResultBlockParam>
  // 3. Adding await before this.tools[toolName](...Object.values(toolInput))
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

  public async run(inputMessages: Anthropic.MessageParam[]): Promise<[Anthropic.MessageParam[], string]> {
    const messages = [...inputMessages];

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
            // TODO: Add await before this.callTool(contentItem) since callTool is now async
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

    // If the max turns is reached, throw an exception
    throw new Error("Max turns reached");
  }
}