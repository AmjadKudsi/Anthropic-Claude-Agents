# modify the user message to request two separate addition operations instead of just one. Try asking for something like calculating two different pairs of numbers in the same request

import fs from 'fs';
import Anthropic from "@anthropic-ai/sdk";
import { sumNumbers, multiplyNumbers } from './functions';

// Initialize the Anthropic client
const client = new Anthropic();

// System prompt with explicit instructions to use tools
const systemPrompt = 
    "You are a helpful math assistant. " +
    "Always use the available tools to perform calculations accurately.";

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// TODO: Modify the user message to request two separate addition operations
const messages: Anthropic.MessageParam[] = [
    { role: "user", content: "Please calculate 15 + 27 and 1115 + 2227" }
];

// Send the messages to Claude
const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: messages,
    system: systemPrompt,
    tools: toolSchemas
});

// Print stop reason
console.log(`Stop Reason: ${response.stop_reason}`);

// Extract and print each content item
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
});