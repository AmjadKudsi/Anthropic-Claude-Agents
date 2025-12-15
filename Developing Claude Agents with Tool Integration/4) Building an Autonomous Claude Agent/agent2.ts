// build a bulletproof tool execution system by implementing the callTool method

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

  // TODO: Implement the callTool method to execute tools and handle errors
  public callTool(toolUse: Anthropic.ToolUseBlock): Anthropic.ToolResultBlockParam {
    // TODO: Get the tool name from toolUse.name
    // TODO: Get the tool input from toolUse.input (use empty object {} if undefined)
    const toolName = toolUse.name;
    const toolInput = toolUse.input || {};
    
    
    // TODO: Get the tool use id from toolUse.id
    const toolUseId = toolUse.id;

    // TODO: Print which tool is being called with its input parameters using console.log
    console.log(`Tool called: ${toolName}(${JSON.stringify(toolInput)})`);
    
    // TODO: Declare a result variable of type string (use let)
    // TODO: Create a try block
      // TODO: Check if toolName is not in this.tools
        // TODO: Set result to an error message: "Error: Tool {toolName} not found"
      // TODO: Add else block
        // TODO: Execute the tool by calling this.tools[toolName] with ...Object.values(toolInput)
        // TODO: Convert the tool result to string and store in result
    // TODO: Add catch block with error parameter typed as any
      // TODO: Set result to an error message using error.message
      
    let result: string;
    try {
      if (!(toolName in this.tools)) {
        result = `Error: Tool ${toolName} not found`;
      } else {
        const toolResult = this.tools[toolName](...Object.values(toolInput));
        result = String(toolResult);
      }
    } catch (error: any) {
      result = `Error: ${error.message}`;
    }

    // TODO: Return an object with type "tool_result", tool_use_id set to toolUseId, and content set to result
    return {
      type: "tool_result",
      tool_use_id: toolUseId,
      content: result
    };
  }

}