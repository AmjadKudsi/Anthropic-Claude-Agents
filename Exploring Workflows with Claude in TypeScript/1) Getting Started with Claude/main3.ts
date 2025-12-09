// transform a single-question interaction into a flowing conversation in which Claude can build upon previous context

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
const textContent = response.content.find((block) => block.type === "text");
if (textContent && textContent.type === "text") {
  console.log(textContent.text);
}

// TODO: Append Claude's response to messages with the assistant role
messages.push({
  role: "assistant",
  content: response.content
})

// TODO: Append a new user message asking "Which one is easier to train?"
messages.push({
  role: "user",
  content: "Which one is easier to train?"
})

// TODO: Send the second request to Claude using the same parameters as the first request
const secondResponse = await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: messages,
  system: systemPrompt,
});

// TODO: Print the text response from the second interaction
const secondTextContent = secondResponse.content.find((block) => block.type === "text");
if (secondTextContent && secondTextContent.type === "text") {
  console.log(secondTextContent.text);
}