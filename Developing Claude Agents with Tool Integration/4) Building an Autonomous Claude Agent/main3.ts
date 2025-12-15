// build a simplified version of the run method in agent.ts that handles basic conversation flow, focusing on the fundamental request-response cycle that forms the backbone of all agent interactions

import Anthropic from "@anthropic-ai/sdk";
import { Agent } from "./agent";

// TODO: Create a simple agent for general conversation with an appropriate system prompt
async function main() {
    
  const agent = new Agent({
    name: "chat_agent",
    systemPrompt: "You are a helpful conversational assistant.",
    
  });

// TODO: Start with a message list containing one user 
  let messages: Anthropic.MessageParam[] = [
    { role: "user", content: "Hi! Can you explain what a black hole is in 3 sentences?" },
  ];

// TODO: Send the first message to the agent and print the response
  const first = await agent.run(messages);
  console.log("Assistant:", first.responseText);

// TODO: Add a follow-up user question to the conversation history
  messages = [
    ...first.messages,
    { role: "user", content: "Cool. What is the event horizon, in one sentence?" },
  ];

// TODO: Send the updated conversation to the agent and print the response
  const second = await agent.run(messages);
  console.log("Assistant:", second.responseText);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});