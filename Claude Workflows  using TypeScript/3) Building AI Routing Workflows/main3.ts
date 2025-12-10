// implement Step 3 of the routing workflow — the part where the specialist uses their domain expertise to provide the final response.

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Ensure you have set your API key in the environment variables
});

// Choose a model to use
const model = "claude-sonnet-4-20250514";

// Router system prompt - decides which specialist to use
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

// Get routing decision from Claude
const routerResponse = await client.messages.create({
  model: model,
  max_tokens: 100, // Short response expected
  messages: routerMessages,
  system: routerPrompt,
});

// Extract the routing decision
const routerTextBlock = routerResponse.content.find(
  (block) => block.type === "text"
);
if (!routerTextBlock || routerTextBlock.type !== "text") {
  throw new Error("No routing decision received");
}
const specialistChoice = routerTextBlock.text.trim();
console.log(`Router decision: ${specialistChoice}`);

// Step 2: Route to the appropriate specialist based on the router's decision
let specialistPrompt: string;
if (specialistChoice === "math_specialist") {
  specialistPrompt = mathSpecialistPrompt;
} else if (specialistChoice === "writing_specialist") {
  specialistPrompt = writingSpecialistPrompt;
} else if (specialistChoice === "code_specialist") {
  specialistPrompt = codeSpecialistPrompt;
} else {
  // Default fallback if router gives unexpected response
  specialistPrompt = "You are a helpful assistant.";
}

// Step 3: Send the original request to the chosen specialist
// TODO: Create a specialistMessages array with the original userRequest
const specialistMessages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: userRequest
  }
];

// TODO: Make an API call to Claude using the chosen specialistPrompt as the system message
const specialistResponse = await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: specialistMessages,
  system: specialistPrompt
});

// TODO: Extract and print the final response from the specialist
const specialistTextBlock = specialistResponse.content.find(block => block.type === "text");
if (!specialistTextBlock || specialistTextBlock.type !== "text") {
  throw new Error("No specialist response recieved");
}
console.log("Specialist Response:");
console.log(specialistTextBlock.text);