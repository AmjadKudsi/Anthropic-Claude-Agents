// extend the Agent class to support handoffs by adding some of the necessary infrastructure
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

// TODO: Add the handoffs parameter to helpfulAssistant, setting it to [calculatorAssistant]
const helpfulAssistant = new Agent({
  name: "helpful_assistant",
  systemPrompt: "You are a helpful assistant. You can assist with various tasks and handoff to the calculator assistant for math problems.",
  handoffs: [calculatorAssistant]
});

// TODO: Print the handoff schema using getHandoffSchema() to verify it was created
// Hint: Use JSON.stringify with null and 2 for pretty printing
console.log(JSON.stringify(helpfulAssistant.getHandoffSchema(), null, 2));