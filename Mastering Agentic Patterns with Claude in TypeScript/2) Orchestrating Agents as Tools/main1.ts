// Implement a createAgentSchema function that generates a proper Claude tool schema for wrapping an agent as a tool

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

// TODO: Define the createAgentSchema function that takes an agent and description as parameters
// The function should create and return a tool schema object with:
// - A "name" field using the pattern: agent.name + "_agent"
// - A "description" field using the provided description parameter
// - An "input_schema" field with the proper structure for a message parameter
function createAgentSchema(agent: Agent, description: string): Anthropic.Tool {
  return {
    name: `${agent.name}_agent`,
    description,
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
}

// Create a calculator assistant
const calculatorAssistant = new Agent({
  name: "calculator_assistant",
  systemPrompt: "You are a calculator assistant. You specialize in mathematical calculations and solving equations.",
  tools: mathTools,
  toolSchemas: toolSchemas,
  maxTurns: 15
});

// TODO: Call your createAgentSchema function with the calculatorAssistant and an appropriate description
const calculatorAgentToolSchema = createAgentSchema(
  calculatorAssistant,
  "Wraps the calculator assistant agent. Provide a message string to send to the agent."
);

// TODO: Print the resulting schema using a readable output
console.log("Calculator Agent Tool Schema:");
console.log(JSON.stringify(calculatorAgentToolSchema, null, 2));