// implement the crucial first steps of the tool execution cycle by learning how to handle Claude's responses, detect tool use requests, and extract the specific tool information when needed

import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { sumNumbers, multiplyNumbers } from './functions';

// Initialize the Anthropic client
const client = new Anthropic();

// Choose a Claude model
const model = 'claude-sonnet-4-20250514';

// System prompt with explicit instructions to use tools
const systemPrompt =
  'You are a helpful math assistant. ' +
  'Always use the available tools to perform calculations accurately.';

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Create a map of tool names to functions
const tools: Record<string, Function> = {
  sum_numbers: sumNumbers,
  multiply_numbers: multiplyNumbers,
};

// Create an array of messages to send to Claude
const messages: Anthropic.MessageParam[] = [
  { role: 'user', content: 'Please calculate 15 + 27' },
];

// Send the messages to Claude
const response = await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: messages,
  system: systemPrompt,
  tools: toolSchemas,
});

// TODO: Add Claude's response to the messages array
// - Use the "assistant" role
// - Set the content to response.content
messages.push({
  role: "assistant",
  content: response.content
});

// TODO: Check if Claude wants to use tools
// TODO: Create a for loop to iterate through response.content
if (response.stop_reason === "tool_use") {

// TODO: Check if contentItem.type equals "tool_use"
// TODO: Extract toolName from contentItem.name
// TODO: Extract toolInput from contentItem.input
// TODO: Extract toolId from contentItem.id

  for (const contentItem of response.content) {
    if (contentItem.type === "tool_use"){
      const toolName = contentItem.name;
      const toolInput = contentItem.input;
      const toolId = contentItem.id;

// TODO: Print all three pieces of information in a clear, formatted message

      
      console.log(`Tool use detected:\n  id: ${toolId}\n  name: ${toolName}\n ${JSON.stringify(toolInput, null, 2)}`
      );
    }
  }
}

// TODO: Handle the case where Claude doesn't want to use tools
// - Print "Claude doesn't want to use tools:" and the response text
  // Execute tools and get final response...
else {
  // Claude doesn't want to use tools: print the response text
  const responseText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  console.log("Claude doesn't want to use tools:");
  console.log(responseText);
}