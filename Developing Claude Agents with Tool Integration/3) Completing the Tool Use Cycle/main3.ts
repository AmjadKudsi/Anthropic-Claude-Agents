// complete the tool execution cycle by sending the updated conversation back to Claude and displaying the polished result

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

// Add the assistant's response to messages
messages.push({
  role: 'assistant',
  content: response.content,
});

// Check if Claude wants to use tools
if (response.stop_reason === 'tool_use') {
  // Create an array to collect all tool results
  const toolResults: Anthropic.ToolResultBlockParam[] = [];

  // Iterate through each content block in Claude's response
  for (const contentItem of response.content) {
    // Check if this content item is a tool use request
    if (contentItem.type === 'tool_use') {
      // Extract the tool name, input, and ID
      const toolName = contentItem.name;
      const toolInput = contentItem.input;
      const toolId = contentItem.id;

      // Print the tool name and input
      console.log(`Executing: ${toolName}(${JSON.stringify(toolInput)})`);

      // Execute the tool and handle errors
      let result: any;
      try {
        // Check if the requested tool exists and execute it
        if (toolName in tools) {
          result = tools[toolName](toolInput.a, toolInput.b);
        } else {
          result = `Error: Function ${toolName} not found`;
        }
      } catch (e: any) {
        // Handle any errors that occur during function execution
        result = `Error executing ${toolName}: ${e.message}`;
      }

      // Print the result for verification
      console.log(`Result: ${result}`);

      // Append the tool result to the collection
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolId,
        content: String(result),
      });
    }
  }

  // Add all tool results as a single user message
  messages.push({
    role: 'user',
    content: toolResults,
  });

  // TODO: Make a second API call to Claude with the updated messages array
  // Use the same parameters as the first call: model, max_tokens, messages, system, tools
  const finalResponse = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: messages,
    system: systemPrompt,
    tools: toolSchemas
  });

  // TODO: Add Claude's final response to the messages array with role "assistant"
  messages.push({
    role: "assistant",
    content: finalResponse.content
  });

  // TODO: Print Claude's final response text using finalResponse.content.find() to extract the text block
  console.log("\nClaude's final response:");
  const textContent = finalResponse.content.find(block => block.type === "text");
  if (textContent && textContent.type === "text"){
    console.log(textContent.text);
  }
} else {
  console.log("Claude doesn't want to use tools:");
  const textContent = response.content.find(
    (block) => block.type === 'text'
  );
  if (textContent && textContent.type === 'text') {
    console.log(textContent.text);
  }
}