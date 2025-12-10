// transform a basic API request into one that enables tool usage, allowing you to observe how Claude's response structure changes when tools are present

import fs from 'fs';
import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// System prompt describing Claude as a math assistant
const systemPrompt = 
    "You are a helpful math assistant.";

// TODO: Load the tool schemas from the schemas.json file
const schemasJson = fs.readFileSync('schemas.json', "utf-8")
const toolSchemas = JSON.parse(schemasJson);

// Create a message requesting a calculation
const messages: Anthropic.MessageParam[] = [
    { role: "user", content: "Please calculate 15 + 27" }
];

// Send the request to Claude
const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: messages,
    system: systemPrompt,
    // TODO: Add the tools parameter with the loaded schemas
    tools: toolSchemas
});

// Print the complete response structure
console.log(JSON.stringify(response, null, 2));