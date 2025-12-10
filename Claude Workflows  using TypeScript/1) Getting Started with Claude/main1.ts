// create a complete Claude interaction by filling in the missing pieces of code that will send a message to Claude and display the full response structure
import Anthropic from "@anthropic-ai/sdk";

// TODO: Initialize the Anthropic client
const client = new Anthropic();

// TODO: Define the model to use
const model = "claude-sonnet-4-20250514";

// TODO: Create a short system prompt that makes Claude a helpful assistant who answers briefly
const systemPrompt = "You are a helpful assistant. Answer questions very briefly.";

// TODO: Create an array of messages to send to Claude with a single user message
const messages: Anthropic.MessageParam[] = [
    {
        role: "user",
        content: "What is the main difference between cats and dogs as pets"
    }
]

// TODO: Send the messages to Claude using client.messages.create() with your model, system prompt and max tokens
const response = await client.messages.create({
    model: model,
    max_tokens: 2000,
    messages: messages,
    system: systemPrompt
})

// Print the whole response as JSON
console.log(JSON.stringify(response, null, 2));