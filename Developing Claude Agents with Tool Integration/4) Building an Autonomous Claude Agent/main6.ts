// make two strategic adjustments to handle this increased complexity:
// Update the agent's maxTurns parameter from the default 10 to 15 turns to give Claude enough iterations to work through all the necessary calculations
// Change the equation from the simpler x² - 5x + 6 = 0 to the more challenging 2x² - 7x + 3 = 0

import fs from 'fs';
import { Agent } from './agent';
import {
  sumNumbers,
  multiplyNumbers,
  subtractNumbers,
  divideNumbers,
  power,
  squareRoot,
} from './functions';

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
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

// TODO: Increase maxTurns to 15 to handle the more complex equation
const agent = new Agent({
  name: 'math_assistant',
  systemPrompt: 'You are a helpful math assistant.',
  tools: tools,
  toolSchemas: toolSchemas,
  maxTurns: 15,
});

// TODO: Change the equation to "2x² - 7x + 3 = 0" for a more complex challenge
const messages: any[] = [
  { role: 'user', content: 'Solve this equation: 2x^2 - 7x + 3 = 0' },
];

// Send message to the stateless agent
const [finalMessages, result] = await agent.run(messages);

// Display the response
console.log('\nFinal response:');
console.log(result);

// Show the conversation history
console.log('\nConversation history:');
finalMessages.forEach((msg, i) => {
  const role = msg.role;
  const content = msg.content;
  console.log(`${i}. ${role}: ${JSON.stringify(content)}`);
});