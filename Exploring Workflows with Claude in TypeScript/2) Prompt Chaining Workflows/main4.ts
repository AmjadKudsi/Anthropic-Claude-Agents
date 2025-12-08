# complete the missing translation logic

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
if (summaryText.length < 250 || summaryText.length > 350) {
    throw new Error(`Summary does not meet character requirement (250-350 characters). Got ${summaryText.length} characters.`);
}

console.log(`✅ SUCCESS: Summary meets character requirement: ${summaryText.length} characters`);

// Step 3: Chain the summary output as input to a translation task
// TODO: Create a system prompt that establishes Claude as a professional Spanish translator
const translationPrompt = "You are a professional translator that provides accurate Spanish translations.";

// TODO: Create the messages array with a user message that uses template literal formatting to safely embed the summaryText
const translationMessages: Anthropic.MessageParam[] = [
    {
        role: "user",
        content: `Return me just the Spanish translation of the following text:\n\n${summaryText}`
    }
]

// TODO: Make the API call to Claude with model, max_tokens=2000, messages, and system parameters
const translationResponse = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: translationMessages,
    system: translationPrompt
});

// TODO: Extract the text from the response and assign it to translationText
const translationTextBlock = translationResponse.content.find(block => block.type === "text");
if (!translationTextBlock || translationTextBlock.type !== "text") {
    throw new Error("No text content in translation response");
}

const translationText = translationTextBlock.text;
console.log("Spanish Translation:");
console.log(translationText);