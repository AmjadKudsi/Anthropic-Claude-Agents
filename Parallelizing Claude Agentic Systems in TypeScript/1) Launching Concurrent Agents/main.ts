import fs from 'fs';
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

// Create a dictionary mapping tool names to functions
const tools: Record<string, Function> = {
  "sum_numbers": sumNumbers,
  "multiply_numbers": multiplyNumbers,
  "subtract_numbers": subtractNumbers,
  "divide_numbers": divideNumbers,
  "power": power,
  "square_root": squareRoot
};

// Write multiple prompts that we'll process sequentially
const prompts = [
  "Solve this: (2 + 3) * (4*4)",
  "Find the roots of x^2 - 5x + 6 = 0",
];

// Create a single agent that will handle multiple conversations
const agent = new Agent({
  name: "math_assistant",
  systemPrompt: "You are a helpful math assistant.",
  tools: tools,
  toolSchemas: toolSchemas,
  maxTurns: 15
});

// Process each prompt one at a time
for (const prompt of prompts) {
  const [_, result] = await agent.run([{ role: "user", content: prompt }]);
  console.log(result);
}