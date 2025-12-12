// enhance a basic system prompt to better guide Claude toward using available tools for mathematical calculations.

import fs from 'fs';
import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// TODO: Enhance this system prompt to guide Claude toward using tools for calculations
const systemPrompt = 
    "You are a helpful assistant." +
    "When performing calculations, use the available tools for accuracy."

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

// Print the complete response structure
console.log(JSON.stringify(response, null, 2));