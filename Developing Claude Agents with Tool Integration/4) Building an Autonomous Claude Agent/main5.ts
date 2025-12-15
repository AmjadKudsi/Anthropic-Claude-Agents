// complete the tool_use branch in the run method (agent5.ts)

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

// Create a map of tool names to functions
const tools: Record<string, Function> = {
    "sum_numbers": sumNumbers,
    "multiply_numbers": multiplyNumbers,
    "subtract_numbers": subtractNumbers,
    "divide_numbers": divideNumbers,
    "power": power,
    "square_root": squareRoot
};

// Create a stateless autonomous agent
const agent = new Agent({
    name: "math_assistant",
    systemPrompt: "You are a helpful math assistant.",
    model: "claude-sonnet-4-20250514",
    tools: tools,
    toolSchemas: toolSchemas
});

// Initialize conversation with user message
const messages: any[] = [{ role: "user", content: "Solve this equation: x² - 5x + 6 = 0" }];

// Send message to the stateless agent
const [finalMessages, result] = await agent.run(messages);

// Display the response
console.log("\nFinal response:");
console.log(result);

// Show the conversation history
console.log("\nConversation history:");
finalMessages.forEach((msg, i) => {
    const role = msg.role;
    const content = msg.content;
    console.log(`${i}. ${role}: ${JSON.stringify(content)}`);
});