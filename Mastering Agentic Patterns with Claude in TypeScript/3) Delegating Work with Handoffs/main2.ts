// make those handoff tools actually available to your agents by updating how request arguments are built
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

// Create a calculator assistant with math tools
const calculatorAssistant = new Agent({
  name: "calculator_assistant",
  systemPrompt: "You are a calculator assistant. You specialize in mathematical calculations and solving equations.",
  tools: mathTools,
  toolSchemas: toolSchemas
});

// Create a general assistant that can handoff to calculator
const helpfulAssistant = new Agent({
  name: "helpful_assistant",
  systemPrompt: "You are a helpful assistant. You can assist with various tasks and handoff to the calculator assistant for math problems.",
  handoffs: [calculatorAssistant]
});

// TODO: Create a simple test message array with a user message (content can be anything simple like "Can you help me with something?")
let messages: Anthropic.MessageParam[] = [
  {
    role: 'user',
    content: 'Can you help me calculate the value of this expression to at least 12 decimal places: ((sqrt(987654321) - sqrt(123456789))^5) / (7^9) + (3.141592653589793^3) / sqrt(2) - (99999^2 - 88888^2) / 12345'
  }
];

// TODO: Call helpfulAssistant.buildRequestArgs(messages) and store the result in a variable called requestArgs
const requestArgs = helpfulAssistant.buildRequestArgs(messages);


// TODO: Print the requestArgs using JSON.stringify(requestArgs, null, 2) to inspect the tools array
console.log(JSON.stringify(requestArgs, null, 2));