# extract and display Claude's actual text response and the stop_reason that tells you why Claude finished generating its answer

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// Choose a model to use
const model = "claude-sonnet-4-20250514";

// Short system prompt starting with "You are"
const systemPrompt = "You are a helpful assistant. Answer questions very briefly.";

// Create an array of messages to send to Claude
const messages: Anthropic.MessageParam[] = [
    {
        role: "user",
        content: "What is the main difference between cats and dogs as pets"
    }
];

// Send the messages to Claude
const response = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: messages,
    system: systemPrompt
});


// TODO: Extract and print the text content from the first content block with the label "Claude's Response:"
const textBlock = response.content.find(block => block.type === "text");

console.log("Claude's Response:");
if (textBlock) {
    console.log(textBlock.text);
} else {
    console.log("No text block found");
}


// TODO: Extract and print the stop_reason field with the label "Stop Reason:"

console.log("Stop Reason:");
console.log(response.stop_reason);