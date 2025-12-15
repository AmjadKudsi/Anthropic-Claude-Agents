// extend the basic run method with the iterative loop framework

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

// Create a dictionary mapping tool names to functions
const tools: Record<string, Function> = {
  sum_numbers: sumNumbers,
  multiply_numbers: multiplyNumbers,
  subtract_numbers: subtractNumbers,
  divide_numbers: divideNumbers,
  power: power,
  square_root: squareRoot,
};

// Create a math assistant agent
const agent = new Agent({
  name: "math_assistant",
  systemPrompt: "You are a helpful math assistant.",
  tools: tools,
  toolSchemas: toolSchemas,
});

// TODO: Test with a simple question like "What is 2 + 2?" and print the response
// Remember to use await when calling agent.run()
(async () => {
  try {
    const [messages, answer] = await agent.run([
      { role: "user", content: "What is 2 + 2?" },
    ]);

    console.log("Answer:", answer);
    // Optional: inspect full conversation
    // console.dir(messages, { depth: null });
  } catch (err) {
    console.error("Agent error:", err);
  }
})();