// implement the mechanism that finds target agents, cleans conversation context, and executes the control transfer

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

// Create a calculator assistant
const calculatorAssistant = new Agent({
  name: "calculator_assistant",
  systemPrompt: "You are a calculator assistant. You specialize in mathematical calculations and solving equations.",
  tools: mathTools,
  toolSchemas: toolSchemas
});

// Create a general assistant (can handoff to calculator)
const helpfulAssistant = new Agent({
  name: "helpful_assistant",
  systemPrompt: "You are a helpful assistant. You can assist with various tasks and handoff to the calculator assistant for math problems.",
  handoffs: [calculatorAssistant]
});

// Mock class to simulate a tool_use object
class MockToolUse {
  name: string;
  input: any;
  id: string;
  type: "tool_use" = "tool_use";

  constructor(name: string, inputDict: any, id: string) {
    this.name = name;
    this.input = inputDict;
    this.id = id;
  }
}

// Test case 1: Valid handoff to calculator_assistant
console.log("=== Test 1: Valid Handoff ===");
const mockToolUse = new MockToolUse(
  "handoff",
  { name: "calculator_assistant", reason: "Testing handoff logic" },
  "test_handoff_1"
);

// Test messages with user and assistant messages
const messages: Anthropic.MessageParam[] = [
  { role: "user", content: "Can you solve 2 + 2?" },
  { role: "assistant", content: [{ type: "text", text: "Let me handoff to the calculator." }] }
];

// TODO: Call helpfulAssistant.callHandoff(mockToolUse as Anthropic.ToolUseBlock, messages) and store the result using array destructuring: [success, result]

const [success1, result1] = await helpfulAssistant.callHandoff(
  mockToolUse as unknown as Anthropic.ToolUseBlock,
  messages
);

// TODO: Print the success boolean, result type using typeof, and result to inspect what the method returns
console.log("Success:", success1);
console.log("Result typeof:", typeof result1);
console.log("Result:", result1)

// Test case 2: Invalid handoff to a non-existent agent
console.log("\n=== Test 2: Invalid Handoff (Agent Not Found) ===");
const mockToolUseInvalid = new MockToolUse(
  "handoff",
  { name: "nonexistent_agent", reason: "Testing error handling" },
  "test_handoff_2"
);

// TODO: Call helpfulAssistant.callHandoff(mockToolUseInvalid as Anthropic.ToolUseBlock, messages) with the invalid mock object
const [success2, result2] = await helpfulAssistant.callHandoff(
  mockToolUseInvalid as unknown as Anthropic.ToolUseBlock,
  messages
);

// TODO: Print the success boolean and result to see how the method handles errors
console.log("Success:", success2);
console.log("Result:", result2);