// see the full orchestration system in action by creating an orchestrator agent that can intelligently decide when to delegate tasks to your calculator specialist

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

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Create a map of tool names to functions
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
   * @returns An array containing [tool_function, tool_schema]
   */
  const agentToolFunction = async (message: string): Promise<string> => {
    console.log(`🦾 Agent tool called (${agent.name}): ${message}`);
    
    // Call the agent
    const [_, response] = await agent.run([{ role: "user", content: message }]);
    
    console.log(`📊 Agent response (${agent.name}): ${response}`);
    
    return response;
  };
  
  // Create schema for this agent tool
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
  toolSchemas: toolSchemas,
  maxTurns: 15
});

// Create agent tool for calculator
const [calculatorToolFunction, calculatorToolSchema] = createAgentTool(
  calculatorAssistant,
  "Call the calculator assistant to solve mathematical problems and equations."
);

// TODO: Create the helpful_assistant orchestrator agent with:
// - name set to "helpful_assistant"
// - A general system prompt explaining it can assist with various tasks and use the calculator tool for math problems
// - tools object containing the calculator tool function mapped to its schema name
// - toolSchemas array containing the calculator tool schema
const helpfulAssistant = new Agent({
  name: "helpful_assistant",
  systemPrompt: "You are a helpful assistant. You can assist with various tasks and use the calculator tool for math problems.",
  tools: { [calculatorToolSchema.name]: calculatorToolFunction },
  toolSchemas: [calculatorToolSchema]
});

// TODO: Create a messages array with a general knowledge question (e.g., "What is the capital of France?")
let messages: Anthropic.MessageParam[] = [
  {
    role: 'user',
    content: 'What is the capital of France'
  }
];

// TODO: Run the helpful_assistant with the messages array and capture both resultMessages and response
let [resultMessages, response] = await helpfulAssistant.run(messages);

// TODO: Print the response
console.log(response);

// TODO: Create a new messages array with a math question (e.g., "What is the solution to the equation x² - 5x + 6 = 0?")
messages = [
  {
    role: 'user',
    content: 'What is the solution to the equation x² - 5x + 6 = 0?'
  }
];

// TODO: Run the helpful_assistant with the new messages array and capture both resultMessages and response
[resultMessages, response] = await helpfulAssistant.run(messages);

// TODO: Print a section header like "=== Final Response ===" followed by the response
console.log('\n=== Final Response ===\n');
console.log(response);