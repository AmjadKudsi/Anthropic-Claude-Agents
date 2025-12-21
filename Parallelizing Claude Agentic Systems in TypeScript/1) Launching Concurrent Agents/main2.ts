// transform this sequential approach into concurrent execution

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

// Write multiple prompts that we'll process concurrently
const prompts = [
  "Solve this: (2 + 3) * (4*4)",
  "Find the roots of x^2 - 5x + 6 = 0",
];

// Create a single agent that will handle multiple conversations concurrently
const agent = new Agent({
  name: "math_assistant",
  systemPrompt: "You are a helpful math assistant.",
  tools: tools,
  toolSchemas: toolSchemas,
  maxTurns: 15
});

// TODO: Create an array of promise tasks using .map() without await
const tasks = prompts.map((prompt) => {
  return agent.run([{ role: "user", content: prompt }]);
});

// TODO: Use Promise.all() to run all tasks concurrently and wait for all to complete
const results = await Promise.all(tasks);

// TODO: Replace this for loop with .forEach() on results to display each conversation's output
results.forEach((runResult, idx) => {
  const [_, result] = runResult;
  console.log(`=== run ${idx + 1} ===`);
  console.log(result);
});