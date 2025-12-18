// make agents callable as tools by updating the Agent class to support asynchronous operations and building a complete wrapper function

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

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Create a map of tool names to functions
const mathTools: Record<string, Function> = {
  "sum_numbers": sumNumbers,
  "multiply_numbers": multiplyNumbers,
  "subtract_numbers": subtractNumbers,
  "divide_numbers": divideNumbers,
  "power": power,
  "square_root": squareRoot
};


function createAgentTool(agent: Agent, description: string): [Function, Anthropic.Tool] {
  /**
   * Create a tool function and schema for using an agent as a tool.
   * 
   * @param agent - The agent to wrap as a tool
   * @param description - Description of what this agent tool does
   * @returns An array containing [tool_function, tool_schema]
   */
  
  // TODO: Define an inner function called agentToolFunction that:
  // - Is declared as async and accepts a message parameter of type string
  // - Returns a Promise<string>
  // - Prints a debug message showing the agent name and incoming message: console.log(`🦾 Agent tool called (${agent.name}): ${message}`)
  // - Calls agent.run() with await and a properly formatted message list: [{ role: "user", content: message }]
  // - Uses array destructuring with _ to ignore the message history and capture only the response
  // - Prints a debug message showing the agent name and response: console.log(`📊 Agent response (${agent.name}): ${response}`)
  // - Returns the response
  
    const agentToolFunction = async (message: string): Promise<string> => {
    console.log(`🦾 Agent tool called (${agent.name}): ${message}`);

    const [_, response] = await agent.run([{ role: "user", content: message }]);

    console.log(`📊 Agent response (${agent.name}): ${response}`);
    return response;
  };
  
  // Create schema for this agent tool
  const toolSchema: Anthropic.Tool = {
    name: `${agent.name}_agent`,
    description: description,
    input_schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to send to the agent"
        }
      },
      required: ["message"]
    }
  };
  
  // TODO: Return an array containing both the agentToolFunction and the toolSchema
  return [agentToolFunction, toolSchema];
}


// Create a calculator assistant
const calculatorAssistant = new Agent({
  name: "calculator_assistant",
  systemPrompt: "You are a calculator assistant. You specialize in mathematical calculations and solving equations.",
  tools: mathTools,
  toolSchemas: toolSchemas,
  maxTurns: 15
});

// TODO: Call createAgentTool with the calculatorAssistant and description:
// "Call the calculator assistant to solve mathematical problems and equations."
// Use array destructuring to capture both the tool function and the schema
const [calculatorToolFunction, calculatorToolSchema] = createAgentTool(
  calculatorAssistant,
  "Call the calculator assistant to solve mathematical problems and equations."
);

// TODO: Test the tool function directly by:
// - Wrapping in a console.log statement showing "=== Testing Calculator Tool Function ==="
// - Calling the tool function with await and a math question like "What is 25 multiplied by 4?"
// - Storing the result in a variable

// TODO: Print the returned result with a newline before it and a label: console.log(`\nReturned result: ${result}`)
(async () => {
  console.log("=== Testing Calculator Tool Function ===");
  const result = await calculatorToolFunction("What is 25 multiplied by 4?");
  console.log(`\nReturned result: ${result}`);
})();