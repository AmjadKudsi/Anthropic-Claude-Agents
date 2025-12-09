// create a robust router system prompt that can analyze user requests and correctly identify which specialist should handle them

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Ensure you have set your API key in the environment variables
});

// Choose a model to use
const model = "claude-sonnet-4-20250514";

// TODO: Create a router system prompt that analyzes user requests and determines which specialist should handle them
// Your prompt should list the three available specialists and instruct Claude to respond with ONLY the specialist name
const routerPrompt = `You are a task router. Your job is to analyze user requests and determine which specialist should handle them. 
Available specialists:
- math_specialist: For mathematical calculations, equations, and numerical problems
- writing_specialist: For creative writing, essays, stories, and text composition
- code_specialist: For programming questions, code review, and technical implementation

Respond with ONLY the specialist name (math_specialist, writing_specialist, or code_specialist) that best matches the user's request.`;

// Specialist system prompts
const mathSpecialistPrompt = "You are a mathematics expert. You excel at solving equations, performing calculations, and explaining mathematical concepts clearly.";

const writingSpecialistPrompt = "You are a creative writing expert. You specialize in crafting engaging stories, essays, and helping with all forms of written communication.";

const codeSpecialistPrompt = "You are a programming expert. You specialize in writing code, debugging, code review, and explaining technical concepts.";

// User request to route
const userRequest = "Write me a short story about robots";

// Step 1: Send request to router to determine which specialist to use
const routerMessages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: userRequest,
  },
];

// TODO: Make an API call to Claude using your routerPrompt as the system message
const routerResponse = await client.messages.create({
  model: model,
  max_tokens: 100,
  messages: routerMessages,
  system: routerPrompt
});

// TODO: Extract the routing decision from the response and print it to verify your router is working
const routerTextBlock = routerResponse.content.find(block => block.type === "text");
if (!routerTextBlock || routerTextBlock.type !== "text") {
  throw new Error("no routing decision received");
}
const specialistChoice = routerTextBlock.text.trim();
console.log(`Router decision: ${specialistChoice}`);