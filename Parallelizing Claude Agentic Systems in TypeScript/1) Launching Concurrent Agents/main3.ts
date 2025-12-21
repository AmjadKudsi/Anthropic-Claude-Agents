// launch three separate concurrent conversations using the same math_assistant agent instance and the same prompt, demonstrating that a single agent can safely handle multiple conversations at once

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

// The math problem we want to solve multiple times
const prompt = "What is 15 * 23 + 47?";

// Create a math assistant agent that will solve the problem
const agent = new Agent({
  name: "math_assistant",
  systemPrompt: "You are a helpful math assistant.",
  tools: tools,
  toolSchemas: toolSchemas,
  maxTurns: 15
});

// Create a verifier agent that will compare multiple answers
const verifier = new Agent({
  name: "verifier",
  systemPrompt: 
    "You are a verification assistant. " +
    "Your job is to analyze multiple answers to the same question " +
    "and determine which answer is most likely correct. " +
    "Look for consistency across answers and explain your reasoning.",
  tools: {},
  toolSchemas: []
});

// TODO: Create three concurrent tasks using the same agent and prompt (use .map() on an array like [1, 2, 3])
const tasks = [1, 2, 3].map(() =>
  agent.run([
    { role: "user", content: prompt }
  ])
);

// TODO: Use Promise.all() to run all tasks concurrently and collect the results
const results = await Promise.all(tasks);

// TODO: Display each result with a label (Result 1:, Result 2:, Result 3:) using .forEach()
results.forEach((result, idx) => {
  console.log(`Result ${idx + 1}:`, result);
});

// TODO: Construct a message for the verifier that contains all three results
const verifierMessage =
  `We asked the same question three times.\n` +
  `Question: ${prompt}\n\n` +
  results
    .map((result, idx) => `Result ${idx + 1}:\n${String(result)}\n`)
    .join("\n") +
  `\nPlease analyze the three results above and determine which answer is most likely correct. ` +
  `Explain your reasoning and note any inconsistencies.`;

// TODO: Call the verifier agent with the message and get its analysis
const verification = await verifier.run([
  { role: "user", content: verifierMessage }
]);

// TODO: Print the verifier's output with a header like "=== Verifier Analysis ==="
console.log("=== Verifier Analysis ===");
console.log(verification);
