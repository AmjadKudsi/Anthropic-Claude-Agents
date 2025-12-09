// enhance your router by adding the thinking parameter to enable extended reasoning, then update your code to handle the new response format

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

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
const userRequest = "I need help creating a mathematical simulation.";

// Step 1: Send request to router to determine which specialist to use
const routerMessages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: userRequest,
  },
];

// TODO: Add the thinking parameter with type: "enabled" and budget_tokens: 1500 to enable extended reasoning
const routerResponse = await client.messages.create({
  model: model,
  max_tokens: 1600, // TODO: Increase max_tokens from 100 to 1600 to accommodate the thinking process
  messages: routerMessages,
  system: routerPrompt,
  thinking: {
    type: "enabled",
    budget_tokens: 1500
    }
});

// TODO: Update the response extraction to handle the new response format by iterating through content blocks to find the text type
const routerTextBlock = routerResponse.content.find(
  (block): block is Anthropic.Messages.TextBlock => block.type === "text"
);
if (!routerTextBlock) {
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
const specialistMessages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: userRequest,
  },
];

// Get response from the chosen specialist
const specialistResponse = await client.messages.create({
  model: model,
  max_tokens: 2000,
  messages: specialistMessages,
  system: specialistPrompt,
});

// Extract and display the specialist's response (Updated)
const specialistTextBlock = specialistResponse.content.find(
  (block): block is Anthropic.Messages.TextBlock => block.type === "text"
);
if (!specialistTextBlock) {
  throw new Error("No specialist response text received");
}
console.log("Specialist Response:");
console.log(specialistTextBlock.text);