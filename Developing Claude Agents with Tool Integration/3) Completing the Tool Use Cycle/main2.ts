// take extracted tool details and use them to execute the real TypeScript functions, then format the results so Claude can understand them

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
  { role: 'user', content: 'Please calculate 15 + 27 and also multiply 6 by 8' },
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

      // Print the extracted information
      console.log(
        `Tool: ${toolName}, Input: ${JSON.stringify(toolInput)}, ID: ${toolId}`
      );

      // TODO: Add a try-catch block to handle tool execution and errors
      let result: any;
      try{

      // TODO: Check if toolName exists in the tools object and execute it
      // Use tools[toolName](toolInput.a, toolInput.b) to pass the input parameters
          if (toolName in tools) {
            result = tools[toolName](toolInput.a, toolInput.b); 
          } 

      // TODO: Handle the case where the tool doesn't exist
      // Set result to an error message about the missing function
          else{
            result = `Error: Function ${toolName} not found`;
          }      
        }
      // TODO: Handle execution exceptions in the catch block
      // Format and set the result with the exception
          catch (e: any){
            result = `Error executing ${toolName}: ${e.message}`;
          }

      // TODO: Print the result for verification
      console.log(`Result: ${result}`);

      // TODO: Append a properly structured tool result object to toolResults
      // - Object should have type "tool_result", tool_use_id matching toolId, and content as String(result)
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolId,
        content: String(result)
      });
    }
  }

  // TODO: After the loop, append all tool results as a single user message to messages
  // - Use role "user" and set content to the toolResults array
  messages.push({
    role: "user",
    content: toolResults
  });

  // TODO: Send the complete conversation with tool results back to Claude
  // Use client.messages.create() with model, max_tokens, messages, system, and tools
  const finalResponse = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: messages,
    system: systemPrompt,
    tools: toolSchemas
  });

  // TODO: Append Claude's final response to messages to maintain conversation history
  messages.push({
    role: "assistant",
    content: finalResponse.content
  });

  // TODO: Display Claude's final response
  // Find the text content block and print it with a header like "\nClaude's final response:"
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