// build a bulletproof tool execution system by implementing the callTool method

import fs from "fs";
import { Agent } from "./agent";
import {
  sumNumbers,
  multiplyNumbers,
  subtractNumbers,
  divideNumbers,
  power,
  squareRoot,
} from "./functions";

// Load the schemas from JSON file
const schemasJson = fs.readFileSync("schemas.json", "utf-8");
const toolSchemas = JSON.parse(schemasJson);

// Create a map of tool names to functions
const tools: Record<string, Function> = {
  "sum_numbers": sumNumbers,
  "multiply_numbers": multiplyNumbers,
  "subtract_numbers": subtractNumbers,
  "divide_numbers": divideNumbers,
  "power": power,
  "square_root": squareRoot,
};

// Create a math assistant agent
const agent = new Agent({
  name: "math_assistant",
  systemPrompt: "You are a helpful math assistant.",
  tools: tools,
  toolSchemas: toolSchemas,
});

// Mock toolUse class to test callTool
class MockToolUse {
  name: string;
  input: any;
  id: string;

  constructor(name: string, inputData: any, id: string) {
    this.name = name;
    this.input = inputData;
    this.id = id;
  }
}

// Mock toolUse object to test callTool
const mockToolUse = new MockToolUse(
  "sum_numbers",
  { a: 5, b: 3 },
  "test_123"
);

// TODO: Call agent.callTool with the mock toolUse object and store the result
async function main() {
  
  const okResult = await agent.callTool(mockToolUse as any);


// TODO: Print the result of the successful tool call
  console.log("Successful tool call result:", okResult);

// TODO: Create another mock toolUse object for a non-existent tool to test error handling
  const errorToolUse = new MockToolUse(
    "does_not_exist",
    { a: 1, b: 2 },
    "test_404"
  );

// TODO: Call agent.callTool with the error mock object and store the result
  const errorResult = await agent.callTool(errorToolUse as any);

// TODO: Print the error scenario result
  console.log("Error scenario result:", errorResult);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});