// implement the core constructor of the Agent class, setting up all the essential components that enable Claude to operate as a truly autonomous problem solver

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
  // TODO: Write a robust base system prompt that instructs Claude to act as an autonomous agent
  private static BASE_SYSTEM_PROMPT = "You are an autonomous agent that can take multiple tool-calling steps when helpful. " +
    "The user only sees your response when you stop using tools, not your tool usage or reasoning steps. " +
    "When you provide your answer without calling tools, make it complete and standalone.\n" +
    "Additional instructions:\n";

  private client: Anthropic;
  public name: string;
  public model: string;
  public systemPrompt: string;
  public maxTurns: number;
  public tools: Record<string, Function>;
  public toolSchemas: Anthropic.Tool[];

  // TODO: Define the constructor that accepts an AgentOptions object with the following properties:
  // - name (required parameter for identifying the agent)
  // - systemPrompt (optional, default: "You are a helpful assistant.")
  // - model (optional, default: "claude-sonnet-4-20250514")
  // - tools (optional, default: {} to avoid shared mutable defaults)
  // - toolSchemas (optional, default: [] to avoid shared mutable defaults)
  // - maxTurns (optional, default: 10)
  constructor(
    {
      name,
      systemPrompt = "You are a helpful assistant.",
      model = "claude-sonnet-4-20250514",
      tools = {},
      toolSchemas = [],
      maxTurns = 10,
    }: 

  // TODO: Inside the constructor:
  // - Initialize the Anthropic client
  // - Set the agent name
  // - Set the model
  // - Combine BASE_SYSTEM_PROMPT with systemPrompt
  // - Set maxTurns
  // - Set up the tools dictionary (use { ...tools } to create a safe copy)
  // - Set up the toolSchemas list (use [...toolSchemas] to create a safe copy)
        AgentOptions
    ) {
    this.client = new Anthropic();
    this.name = name;
    this.model = model;
    this.systemPrompt = Agent.BASE_SYSTEM_PROMPT + systemPrompt;
    this.maxTurns = maxTurns;
    
    this.tools = { ...tools };
    this.toolSchemas = [...toolSchemas];
    }
  }