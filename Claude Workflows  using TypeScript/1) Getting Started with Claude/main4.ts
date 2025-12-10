// replace the simple text extraction in the second print statement with a more sophisticated approach

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
    content: "What is the main difference between cats and dogs as pets",
  },
];

// Helper to extract all text blocks from a Claude message response
function extractAllText(contentBlocks: Anthropic.ContentBlock[]): string {
  return contentBlocks
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

// Send the messages to Claude
const response = await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: messages,
  system: systemPrompt,
});

// Use the helper for the first response
const fullText1 = extractAllText(response.content);
console.log(fullText1);

// Print the text response
// const textContent = response.content.find((block) => block.type === "text");
// if (textContent && textContent.type === "text") {
//   console.log(textContent.text);
// }

// Append Claude's response to messages
messages.push({
  role: "assistant",
  content: response.content,
});

// Append a new user message
messages.push({
  role: "user",
  content: "Which one is easier to train?",
});

// Send the second request
const secondResponse = await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: messages,
  system: systemPrompt,
});

// TODO: Replace the simple text extraction with a robust approach that filters all content blocks for text type and joins them
// const secondTextContent = secondResponse.content.find(
//   (block) => block.type === "text"
// );
// if (secondTextContent && secondTextContent.type === "text") {
//   console.log(secondTextContent.text);
// }

// Use the helper for the second response
const fullText2 = extractAllText(secondResponse.content);
console.log(fullText2);