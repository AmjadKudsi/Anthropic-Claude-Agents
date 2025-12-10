// implement the foundation of a prompt chain by creating the summary generation step, which will later feed into validation and translation

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// Choose a model to use
const model = "claude-sonnet-4-20250514";

// Step 1: Ask Claude to write a summary with specific character constraints
// TODO: Create a system prompt that tells Claude to be a helpful summary assistant
const summaryPrompt = "You are a helpful assistant that writes clear, concise summaries.";

// TODO: Create the messages list with a user message requesting a 300-character summary about something
const summaryMessages: Anthropic.MessageParam[] = [
    {
        role: "user",
        content: "Write a 300 characters summary of artificial intelligence and its current application in healthcare."
    }
]

// TODO: Make the API call to Claude with model, max_tokens=2000, messages, and system parameters
const summaryResponse = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: summaryMessages,
    system: summaryPrompt
});

// TODO: Extract the text from the response and assign it to summaryText

const summaryTextBlock = summaryResponse.content.find(block => block.type === "text");
if (!summaryTextBlock || summaryTextBlock.type !== "text") {
    throw new Error("No text content in summary response");
}
const summaryText = summaryTextBlock.text;

console.log("Summary:");
console.log(summaryText);