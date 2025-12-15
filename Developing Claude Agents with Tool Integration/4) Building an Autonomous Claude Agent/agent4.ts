// extend the basic run method with the iterative loop framework

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

  private extractText(content: Anthropic.ContentBlock[]): string {
    // Return a joined string of all text blocks from content
    return content
      .filter((block) => block.type === "text")
      .map((block) => (block as Anthropic.TextBlock).text)
      .join("");
  }

  private buildRequestArgs(
    messages: Anthropic.MessageParam[]
  ): Anthropic.Messages.MessageCreateParams {
    // Create an object with the basic request arguments
    const requestArgs: Anthropic.Messages.MessageCreateParams = {
      model: this.model,
      system: this.systemPrompt,
      messages: messages,
      max_tokens: 8000,
    };

    // Add tool schemas only if they exist
    if (this.toolSchemas.length > 0) {
      requestArgs.tools = this.toolSchemas;
    }

    // Return the complete set of arguments to use for the API call
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

  public async run(
    inputMessages: Anthropic.MessageParam[]
  ): Promise<[Anthropic.MessageParam[], string]> {
    // Create a copy of the input messages to avoid modifying the original
    const messages = [...inputMessages];

    // TODO: Initialize a turn counter to 0 to track iterations
    let turn = 0;

    // TODO: Create a while loop that continues while turn < this.maxTurns
    while (turn < this.maxTurns){

    // TODO: Increment the turn counter
    turn++;

    // Make an API call to Claude using the prepared request arguments
    const response = await this.client.messages.create(
      this.buildRequestArgs(messages)
    );

    // Add Claude's response to messages exactly as returned (text + tool_use blocks)
    messages.push({ role: "assistant", content: response.content });
    

    // TODO: Check if Claude wants to use tools by checking if response.stop_reason === "tool_use"
    // TODO: If so, return [messages, "Tool use detected but not implemented yet"]
    if (response.stop_reason === "tool_use") {
      // Placeholder because tools are not executed yet
      return [messages, "Tool use detected but not implemented yet"];
    }    

    // TODO: Add an else clause for when Claude doesn't want to use tools
    // Extract the text from the response
    const responseText = this.extractText(response.content);

    // Return the updated messages and the extracted response text
    return [messages, responseText];

    // TODO: After the while loop, throw an Error("Max turns reached")
    }
  throw new Error("Max turns reached");
  }
}