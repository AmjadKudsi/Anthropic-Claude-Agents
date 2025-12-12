// replace the basic JSON output with targeted parsing that examines Claude's structured response

import fs from 'fs';
import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// System prompt with tool usage guidance for calculations
const systemPrompt = 
    "You are a helpful math assistant. " +
    "Always use the available tools to perform calculations accurately.";

// Load the tool schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Create a message requesting a calculation
const messages: Anthropic.MessageParam[] = [
    { role: "user", content: "Please calculate 15 + 27" }
];

// Send the request with tools enabled
const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: messages,
    system: systemPrompt,
    tools: toolSchemas
});

// TODO: Extract and print the stop_reason from the response
console.log(`stop_reason: ${response.stop_reason}`);

// TODO: Create a loop to iterate through each content item in response.content with enumeration
    // TODO: Print the content item number and type
    // TODO: Check if the content item type is "text" and print the text content
    // TODO: Check if the content item type is "tool_use" and print the tool name, input, and ID
    
response.content.forEach((contentItem, index) => {
    console.log(`\nContent Item ${index + 1}:`);
    console.log(`Type: ${contentItem.type}`);    
    
    if (contentItem.type === "text") {
        console.log(`Text: ${contentItem.text}`);
    } else if (contentItem.type === "tool_use") {
        console.log(`Tool Name: ${contentItem.name}`);
        console.log(`Tool Input: ${JSON.stringify(contentItem.input)}`);
        console.log(`Tool ID: ${contentItem.id}`);
    }
})