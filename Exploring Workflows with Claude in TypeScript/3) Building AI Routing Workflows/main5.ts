// extend your routing system with a fourth specialist: science_specialist

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// Choose a model to use
const model = "claude-sonnet-4-20250514";

// TODO: Add a fourth specialist (science_specialist) to the router prompt and update the response instruction
// Router system prompt - decides which specialist to use
const routerPrompt = `You are a task router. Your job is to analyze user requests and determine which specialist should handle them.

Available specialists:
- math_specialist: For mathematical calculations, equations, and numerical problems
- writing_specialist: For creative writing, essays, stories, and text composition
- code_specialist: For programming questions, code review, and technical implementation
- science_specialist: For scientific concepts, natural phenomena, and experimental processes

Respond with ONLY the specialist name (math_specialist, writing_specialist, or code_specialist) that best matches the user's request.`;

// Specialist system prompts
const mathSpecialistPrompt = "You are a mathematics expert. You excel at solving equations, performing calculations, and explaining mathematical concepts clearly.";

const writingSpecialistPrompt = "You are a creative writing expert. You specialize in crafting engaging stories, essays, and helping with all forms of written communication.";

const codeSpecialistPrompt = "You are a programming expert. You specialize in writing code, debugging, code review, and explaining technical concepts.";

// TODO: Create a scienceSpecialistPrompt for handling scientific concepts, theories, and natural phenomena
const scienceSpecialistPrompt = "You are a science expert. You specialize in all-round scientific concepts and experiments";

// User request to route
const userRequest = "How does photosynthesis work in plants?";

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
const routerTextBlock = routerResponse.content.find(block => block.type === "text");
if (!routerTextBlock || routerTextBlock.type !== "text") {
  throw new Error("No routing decision received");
}
const specialistChoice = routerTextBlock.text.trim();
console.log(`Router decision: ${specialistChoice}`);

// Step 2: Route to the appropriate specialist based on the router's decision

// TODO: Add a fourth condition for science_specialist in the if-else if-else logic
let specialistPrompt: string;
if (specialistChoice === "math_specialist") {
  specialistPrompt = mathSpecialistPrompt;
} else if (specialistChoice === "writing_specialist") {
  specialistPrompt = writingSpecialistPrompt;
} else if (specialistChoice === "code_specialist") {
  specialistPrompt = codeSpecialistPrompt;
} else if (specialistChoice === "science_specialist"){
  specialistPrompt = scienceSpecialistPrompt;
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

// Extract and display the specialist's response
const specialistTextBlock = specialistResponse.content.find(
  (block) => block.type === "text"
);
if (specialistTextBlock && specialistTextBlock.type === "text") {
  console.log("Specialist Response:");
  console.log(specialistTextBlock.text);
}