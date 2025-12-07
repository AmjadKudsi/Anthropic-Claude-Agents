# modify your second API call to enable Claude's thinking capabilities

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

// Send the messages to Claude
const response = await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: messages,
  system: systemPrompt,
});

// Print the text response
console.log("First response text:");
const textContent = response.content.find((block) => block.type === "text");
if (textContent && textContent.type === "text") {
  console.log(textContent.text);
}

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

// TODO: Add thinking parameter with type "enabled" and budget_tokens 10000
// Remember to increase your max_tokens to accomodate all the tokens
const secondResponse = await client.messages.create({
  model: model,
  max_tokens: 16000,
  messages: messages,
  system: systemPrompt,
  thinking: {
    type: "enabled",
    budget_tokens: 10000
  }
});

// Print the whole response as JSON
console.log("\nSecond response JSON:");
console.log(JSON.stringify(secondResponse, null, 2));

// Get all text content from the second response
console.log("\nSecond response text:");
const textContents = secondResponse.content
  .filter((block) => block.type === "text")
  .map((block) => (block as Anthropic.TextBlock).text);
console.log(textContents.join("\n"));