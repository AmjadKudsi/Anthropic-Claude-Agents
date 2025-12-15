// implement the core constructor of the Agent class, setting up all the essential components that enable Claude to operate as a truly autonomous problem solver

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
  sum_numbers: sumNumbers,
  multiply_numbers: multiplyNumbers,
  subtract_numbers: subtractNumbers,
  divide_numbers: divideNumbers,
  power: power,
  square_root: squareRoot,
};

// TODO: Create a math assistant agent by passing an options object with:
// - A descriptive name for the agent (e.g., "math_assistant")
// - A system prompt that identifies the agent as a math assistant
// - The tools map defined above
// - The toolSchemas loaded from the JSON file
const agent = new Agent({
  name: "math_assistant",
  systemPrompt: "You are a helpful math assistant.",
  model: "claude-sonnet-4-20250514",
  tools: tools,
  toolSchemas: toolSchemas,
  maxTurns: 15
});

// TODO: Print the agent's name
// TODO: Print the agent's model
// TODO: Print the agent's maxTurns
// TODO: Print the agent's systemPrompt
// TODO: Print the agent's number of tools
// TODO: Print the agent's number of tool schemas

console.log("Agent name:", agent.name);
console.log("Agent model:", agent.model);
console.log("Agent maxTurns:", agent.maxTurns);
console.log("Agent systemPrompt:", agent.systemPrompt);
console.log("Number of tools:", Object.keys(agent.tools).length);
console.log("Number of tool schemas:", agent.toolSchemas.length);