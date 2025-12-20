// modify the tool execution loop in the run method to detect and handle handoff tool calls differently from regular tools

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

// Example test messages
const messages1: Anthropic.MessageParam[] = [
  {
    role: 'user', 
    content: 'What is the capital of France?'
  }
];

const messages2: Anthropic.MessageParam[] = [
  {
    role: 'user', 
    content: 'What is the solution to the equation x² - 5x + 6 = 0?'
  }
];

// Call helpfulAssistant.run with messages1 and print the response
let [resultMessages1, response1] = await helpfulAssistant.run(messages1);
console.log(response1);

// Call helpfulAssistant.run with messages2 and print the response
let [resultMessages2, response2] = await helpfulAssistant.run(messages2);
console.log('\n=== Final Response ===\n');
console.log(response2);