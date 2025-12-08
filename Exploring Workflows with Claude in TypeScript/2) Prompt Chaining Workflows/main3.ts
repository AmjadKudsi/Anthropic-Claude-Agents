# make your guardrails more restrictive to meet stricter requirements

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// Choose a model to use
const model = "claude-sonnet-4-20250514";

// Step 1: Ask Claude to write a summary with specific character constraints
const summaryPrompt = "You are a helpful assistant that writes clear, concise summaries.";

const summaryMessages: Anthropic.MessageParam[] = [
    {
        role: "user",
        content: "Write a 300 characters summary of artificial intelligence and its current applications in healthcare."
    }
];

// Send the first request to Claude for summary generation
const summaryResponse = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: summaryMessages,
    system: summaryPrompt
});

// Extract the summary text from Claude's response
const summaryTextBlock = summaryResponse.content.find(block => block.type === "text");
if (!summaryTextBlock || summaryTextBlock.type !== "text") {
    throw new Error("No text content in summary response");
}
const summaryText = summaryTextBlock.text;
console.log("Summary:");
console.log(summaryText);

// Step 2: Validate that the summary meets our character requirements
// TODO: Change the validation range to be more restrictive (295-305 characters instead of 250-350)
if (summaryText.length < 295 || summaryText.length > 305) {
    // TODO: Update the error message to reflect the new character range (295-305)
    throw new Error(`Summary does not meet character requirement (295-305 characters). Got ${summaryText.length} characters.`);
}

console.log(`✅ SUCCESS: Summary meets character requirement: ${summaryText.length} characters`);