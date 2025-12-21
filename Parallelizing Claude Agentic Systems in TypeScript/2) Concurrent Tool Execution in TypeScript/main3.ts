// modify the user message in main.ts to create a more complex problem that requires calculating costs for four or five stores instead of three

import fs from 'fs';
import Anthropic from "@anthropic-ai/sdk";
import { Agent } from './agent';
import {
  sumNumbers,
  multiplyNumbers,
  subtractNumbers,
  divideNumbers,
  power,
  squareRoot
} from './functions';

// Load tool schemas
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Math tools
const mathTools: Record<string, Function> = {
  "sum_numbers": sumNumbers,
  "multiply_numbers": multiplyNumbers,
  "subtract_numbers": subtractNumbers,
  "divide_numbers": divideNumbers,
  "power": power,
  "square_root": squareRoot
};

function createAgentTool(agent: Agent, description: string): [Function, Anthropic.Tool] {
  /**
   * Create a tool function and schema for using an agent as a tool.
   * 
   * @param agent - The agent to wrap as a tool
   * @param description - Description of what this agent tool does
   * @returns A tuple of [tool_function, tool_schema]
   */
  const agentToolFunction = async (message: string): Promise<string> => {
    const [_, response] = await agent.run([{ role: "user", content: message }]);
    console.log(`📊 Agent (${agent.name}) as tool finished working`);
    return response;
  };
  
  const toolSchema: Anthropic.Tool = {
    name: `${agent.name}_agent`,
    description: description,
    input_schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to send to the agent"
        }
      },
      required: ["message"]
    }
  };
  
  return [agentToolFunction, toolSchema];
}

// Create a calculator assistant
const calculatorAssistant = new Agent({
  name: "calculator_assistant",
  systemPrompt: "You are a calculator assistant. You specialize in mathematical calculations and solving equations.",
  tools: mathTools,
  toolSchemas: toolSchemas
});

// Create agent tool for calculator
const [calculatorToolFunction, calculatorToolSchema] = createAgentTool(
  calculatorAssistant,
  "Call the calculator assistant to solve a single mathematical problem or equation."
);

// Create the orchestrator assistant
const orchestrator = new Agent({
  name: "orchestrator",
  systemPrompt: (
    "You are a math orchestration coordinator. When given complex problems with multiple independent " +
    "subproblems, you MUST break them down and delegate each subproblem to a separate calculator agent call. " +
    "Issue multiple calculator_assistant_agent tool calls IN PARALLEL within the same turn for independent " +
    "calculations. Each agent call should handle ONE specific calculation or equation. " +
    "After all agents return results, synthesize them into a clear, complete final answer."
  ),
  tools: { [calculatorToolSchema.name]: calculatorToolFunction },
  toolSchemas: [calculatorToolSchema]
});

// TODO: Modify this message to add Store D and optionally Store E
// Follow the same format: specify number of items, price per item, and shipping cost for each new store.
const messages: Anthropic.MessageParam[] = [
  {
    role: 'user',
    content: (
      'I need to calculate the total cost of five different purchases:\n' +
      '- Store A: 15 items at $12.50 each, plus $8.99 shipping\n' +
      '- Store B: 23 items at $9.75 each, plus $12.50 shipping\n' +
      '- Store C: 8 items at $24.99 each, plus $6.25 shipping\n' +
      '- Store D: 31 items at $7.20 each, plus $15.00 shipping\n' +
      '- Store E: 5 items at $199.99 each, plus $25.50 shipping\n' +
      'What is the grand total across all five stores?'
    )
  }
];


const [resultMessages, response] = await orchestrator.run(messages);
console.log('\n=== Final Response ===\n');
console.log(response);