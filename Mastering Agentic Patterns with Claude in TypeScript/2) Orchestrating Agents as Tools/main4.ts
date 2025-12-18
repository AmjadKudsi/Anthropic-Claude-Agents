// add a second specialist agent that can verify mathematical solutions

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
  const agentToolFunction = async (message: string): Promise<string> => {
    console.log(`🦾 Agent tool called (${agent.name}): ${message}`);
    
    // Call the agent
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

// Create agent tool for calculator
const [calculatorToolFunction, calculatorToolSchema] = createAgentTool(
  calculatorAssistant,
  "Call the calculator assistant to solve mathematical problems and equations."
);

// TODO: Create a verifier assistant Agent with:
// - name set to "verifier_assistant"
// - A system prompt focused on verification (e.g., "You are a solution verifier. You specialize in checking and verifying mathematical calculations and solutions.")
// - tools set to mathTools (it needs the same math tools to verify calculations)
// - toolSchemas set to toolSchemas
const verifierAssistant = new Agent({
  name: "verifier_assistant",
  systemPrompt: 
  "You are a solution verifier. You specialize in checking and verifying mathematical calculations and solutions. " +
  "Recompute results carefully using the available math tools. If you find an error, explain the correction.",
  tools: mathTools,
  toolSchemas: toolSchemas,
  maxTurns: 15
});


// TODO: Create an agent tool for the verifier by calling createAgentTool with:
// - The verifierAssistant agent
// - An appropriate description about verification (e.g., "Call the verifier assistant to double-check and verify mathematical calculations and solutions.")
// - Use array destructuring to capture both verifierToolFunction and verifierToolSchema
const [verifierToolFunction, verifierToolSchema] = createAgentTool(
  verifierAssistant,
  "Call the verifier assistant to double-check and verify mathematical calculations and solutions."
);

// Create a general assistant (you'll need to update this)
// TODO: Update the helpfulAssistant to:
// - Modify the system prompt to mention using BOTH the calculator and verifier tools, and emphasize double-checking calculations
// - Update the tools object to include BOTH calculatorToolFunction and verifierToolFunction mapped to their schema names
// - Update the toolSchemas array to include BOTH calculatorToolSchema and verifierToolSchema
const helpfulAssistant = new Agent({
  name: "helpful_assistant",
  systemPrompt:
    "You are a helpful assistant. You can assist with various tasks. " +
    "For math problems, use the calculator assistant tool to solve, then use the verifier assistant tool to double-check the result before answering.",
  tools: {
    [calculatorToolSchema.name]: calculatorToolFunction,
    [verifierToolSchema.name]: verifierToolFunction
  },
  toolSchemas: [calculatorToolSchema, verifierToolSchema],
  maxTurns: 15
});

// Create a message list with a mathematical problem
const messages: Anthropic.MessageParam[] = [
  {
    role: 'user', 
    content: 'What is the solution to the equation 4x - 7 = 9?'
  }
];

// Run the orchestrator agent
const [resultMessages, response] = await helpfulAssistant.run(messages);

// Display the orchestrator's response to the user
console.log('\n=== Final Response ===\n');
console.log(response);