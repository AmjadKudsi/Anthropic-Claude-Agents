# extend your existing chain by adding a fourth step that uses Claude to evaluate the translation quality

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
const translationPrompt = "You are a professional translator that provides accurate Spanish translations.";

const translationMessages: Anthropic.MessageParam[] = [
    {
        role: "user",
        content: `Return me just the Spanish translation of the following text:\n\n${summaryText}`
    }
];

// Send the second request to Claude using the summary from the first call
const translationResponse = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: translationMessages,
    system: translationPrompt
});

// Extract and display the final translation result
const translationTextBlock = translationResponse.content.find(block => block.type === "text");
if (!translationTextBlock || translationTextBlock.type !== "text") {
    throw new Error("No text content in translation response");
}
const translationText = translationTextBlock.text;
console.log("Spanish Translation:");
console.log(translationText);

// Step 4: Review the translation quality by comparing both versions
// TODO: Create a system prompt that establishes Claude as a bilingual translation reviewer who can assess translation quality and accuracy
const reviewPrompt =  "You are a bilingual translation reviewer. Compare English source text with its Spanish translation and provide clear, structured feedback on accuracy, fluency, terminology, and tone, plus an overall quality score from 1 to 10.";

// TODO: Create the messages array with a user message that uses template literal formatting to include both the summaryText (English) and translationText (Spanish) while requesting feedback on translation quality
const reviewMessages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: `Please review the following translation.

English source:
${summaryText}

Spanish translation:
${translationText}

Evaluate how accurate and faithful the Spanish version is to the English source, point out any errors or omissions, suggest corrections if needed, and give an overall quality score from 1 to 10.`
  }
];

// TODO: Make the API call to Claude with model, max_tokens: 2000, messages, and system parameters
const reviewResponse =  await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: reviewMessages,
  system: reviewPrompt
});

// TODO: Extract the feedback text from the response using .find() and type guards, then assign it to feedbackText
const reviewTextBlock = reviewResponse.content.find(block => block.type === "text");
if (!reviewTextBlock || reviewTextBlock.type !== "text") {
  throw new Error("No text content in review response");
}
const feedbackText = reviewTextBlock.text;

console.log("Translation Feedback:");
console.log(feedbackText);