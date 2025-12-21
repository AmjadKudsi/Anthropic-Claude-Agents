// modify the Agent class to execute multiple tool calls in parallel instead of one after another

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

    this.tools = { ...tools };
    this.toolSchemas = [...toolSchemas];
    this.handoffs = [...handoffs];

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

    const allTools: Anthropic.Tool[] = [];

    if (this.toolSchemas.length > 0) {
      allTools.push(...this.toolSchemas);
    }

    if (this.handoffs.length > 0) {
      allTools.push(this.handoffSchema);
    }

    if (allTools.length > 0) {
      requestArgs.tools = allTools;
    }

    return requestArgs;
  }

  private async callTool(toolUse: Anthropic.ToolUseBlock): Promise<Anthropic.ToolResultBlockParam> {
    const toolName = toolUse.name;
    const toolInput = toolUse.input || {};
    const toolUseId = toolUse.id;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔧 Tool called: ${toolName}(${JSON.stringify(toolInput)})`);

    let result: string;
    try {
      if (!(toolName in this.tools)) {
        result = `Error: Tool ${toolName} not found`;
      } else {
        // TODO: Wrap the tool function call with Promise.resolve() to handle both synchronous and asynchronous tools uniformly
        const toolResult = await Promise.resolve(
          this.tools[toolName](...Object.values(toolInput))
        );
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
    const agentName = (toolUse.input as any)?.name;
    const reason = (toolUse.input as any)?.reason || "No reason provided";

    console.log(`🔄 Handoff to: ${agentName}`);
    console.log(`📝 Reason: ${reason}`);

    try {
      const targetAgent = this.handoffs.find(agent => agent.name === agentName);
      if (!targetAgent) {
        throw new Error(`Agent '${agentName}' not found`);
      }

      const cleanMessages = messages[messages.length - 1]?.role === "assistant"
        ? messages.slice(0, -1)
        : messages;

      return [true, await targetAgent.run(cleanMessages)];

    } catch (error: any) {
      return [false, {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: `Handoff failed: ${error.message}. Available agents: ${JSON.stringify(this.handoffs.map(agent => agent.name))}`
      }];
    }
  }

  public async run(inputMessages: Anthropic.MessageParam[]): Promise<[Anthropic.MessageParam[], string]> {
    const messages = [...inputMessages];

    let turn = 0;

    while (turn < this.maxTurns) {
      turn++;

      const response = await this.client.messages.create(this.buildRequestArgs(messages));

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason === "tool_use") {
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        
        // TODO: Create a tasks array to collect Promise objects from callTool() without awaiting them immediately
        const tasks: Array<Promise<Anthropic.ToolResultBlockParam>> = [];

        for (const contentItem of response.content) {
          if (contentItem.type === "tool_use") {
            if (contentItem.name === "handoff") {
              const [handoffSuccess, handoffResult] = await this.callHandoff(contentItem, messages);
              if (handoffSuccess) {
                return handoffResult;
              } else {
                toolResults.push(handoffResult);
              }
            } else {
              // TODO: Schedule regular tool call as a concurrent async task instead of directly calling them
              tasks.push(this.callTool(contentItem));
            }
          }
        }

        // TODO: After the loop, use Promise.all() to execute all collected tool tasks concurrently and spread the results into toolResults
        toolResults.push(...(await Promise.all(tasks)));

        messages.push({
          role: "user",
          content: toolResults
        });

      } else {
        const responseText = this.extractText(response.content);
        return [messages, responseText];
      }
    }

    throw new Error("Max turns reached");
  }
}