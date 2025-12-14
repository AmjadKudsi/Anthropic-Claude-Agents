// enable extended thinking to the first API call and print Claude's reasoning

import fs from 'fs';
import Anthropic from "@anthropic-ai/sdk";
import { sumNumbers, multiplyNumbers } from './functions';

// Initialize the Anthropic client
const client = new Anthropic();

// Choose a Claude model
const model = "claude-sonnet-4-20250514";

// System prompt with explicit instructions to use tools
const systemPrompt = 
    "You are a helpful math assistant. " +
    "Always use the available tools to perform calculations accurately.";

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Create a map of tool names to functions
const tools: Record<string, Function> = {
    "sum_numbers": sumNumbers,
    "multiply_numbers": multiplyNumbers
};

// Create an array of messages to send to Claude
const messages: Anthropic.MessageParam[] = [
    { role: "user", content: "Please calculate 15 + 27" }
];

// Send the messages to Claude
const response = await client.messages.create({
    model: model,
    max_tokens: 6000,  // TODO: Update max_tokens to 6000
    messages: messages,
    system: systemPrompt,
    tools: toolSchemas,
    // TODO: Add the thinking parameter to enable extended thinking (use type: "enabled" and budget_tokens: 4000)
    thinking: {
        type: "enabled",
        budget_tokens: 4000
    }
});

// TODO: Print Claude's thinking from the initial response by finding content blocks with type "thinking"
console.log("\nClaude's thinking (initial response):");

for (const block of response.content) {
  if (block.type === "thinking") {
    console.log(block.thinking); // the model's thinking text
  } else if (block.type === "redacted_thinking") {
    console.log("[redacted_thinking]"); // some thinking may be redacted in certain cases
  }
}

// Add the assistant's response to messages
messages.push({
    role: "assistant",
    content: response.content
});

// Check if Claude wants to use any functions and execute them
if (response.stop_reason === "tool_use") {
    // Define an array to collect all tool results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const contentItem of response.content) {
        // Check if the content item is a tool use
        if (contentItem.type === "tool_use") {
            // Get the tool name, input, and id
            const toolName = contentItem.name;
            const toolInput = contentItem.input;
            const toolId = contentItem.id;
            
            // Print the tool name, input
            console.log(`Executing: ${toolName}(${JSON.stringify(toolInput)})`);
            
            // Use try-catch to handle both missing tools and execution errors
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
     
            // Print the result
            console.log(`Result: ${result}`);

            // Append a properly structured tool_result for this specific tool_use
            toolResults.push({
                type: "tool_result",
                tool_use_id: toolId,
                content: String(result)
            });
        }
    }

    // Add all tool results as a single user message
    messages.push({
        role: "user",
        content: toolResults
    });

    // Send the results back to Claude for the final response
    const finalResponse = await client.messages.create({
        model: model,
        max_tokens: 6000,
        messages: messages,
        system: systemPrompt,
        tools: toolSchemas,
        thinking: {
        type: "enabled",
        budget_tokens: 4000,
    }   
    });

    // Append the final response to messages
    messages.push({
        role: "assistant",
        content: finalResponse.content
    });

    // Print the final response
    console.log("\nClaude's final response:");
    const textContent = finalResponse.content.find(block => block.type === "text");
    if (textContent && textContent.type === "text") {
        console.log(textContent.text);
    }

} else {
    // Print the response if Claude did not use any tools
    console.log("Claude did not use any tools:");
    const textContent = response.content.find(block => block.type === "text");
    if (textContent && textContent.type === "text") {
        console.log(textContent.text);
    }
}