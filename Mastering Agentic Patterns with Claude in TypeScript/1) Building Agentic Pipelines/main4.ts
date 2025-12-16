// implement a self-validation system where your Calculator Agent reviews its own work and provides a simple True/False assessment of correctness

import fs from 'fs';
import Anthropic from "@anthropic-ai/sdk";
import { Agent } from './agent';
import { 
  sumNumbers,
  multiplyNumbers,
  subtractNumbers,
  divideNumbers,
  power,
  squareRoot
} from './functions';

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Create a map of tool names to functions
const mathTools: Record<string, Function> = {
  "sum_numbers": sumNumbers,
  "multiply_numbers": multiplyNumbers,
  "subtract_numbers": subtractNumbers,
  "divide_numbers": divideNumbers,
  "power": power,
  "square_root": squareRoot
};

// Agent 1: Problem Analyzer
const problemAnalyzer = new Agent({
  name: "problem_analyzer",
  systemPrompt: 
    "You are a mathematical problem analyzer. Your job is to:\n" +
    "1. Break down complex math problems into clear, sequential steps\n" +
    "2. Identify what calculations are needed at each step\n" +
    "3. Output a structured plan that another agent can follow to perform " +
    "calculations\n" +
    "4. Do NOT perform the actual calculations - just create the " +
    "step-by-step plan"
});

// Agent 2: Calculator Agent
const calculatorAgent = new Agent({
  name: "calculator_agent",
  systemPrompt: 
    "You are a calculator agent. Your job is to:\n" +
    "1. Take a step-by-step calculation plan\n" +
    "2. Execute each calculation using your available math tools\n" +
    "3. Show your work clearly for each step\n" +
    "4. Provide the numerical results in a structured format",
  tools: mathTools,
  toolSchemas: toolSchemas
});

// Agent 3: Solution Presenter
const solutionPresenter = new Agent({
  name: "solution_presenter",
  systemPrompt: 
    "You are a solution presenter. Your job is to:\n" +
    "1. Take calculation results and present them as a complete, " +
    "educational solution\n" +
    "2. Explain what each step accomplished and why it was necessary\n" +
    "3. Provide the final answer clearly\n" +
    "4. Make the solution easy to understand for someone learning math"
});

// Define our complex problem
const complexProblem = 
  "A rectangular garden is 12 meters long and 8 meters wide. " +
  "How much fencing is needed to go around the perimeter? " +
  "Also, if grass seed is needed at a rate of 0.25 kg per square meter, " +
  "how much grass seed is required for the entire garden?";

// Create the initial message with the complex problem for the analyzer
const analysisMessages: Anthropic.MessageParam[] = [
  { role: "user", content: complexProblem }
];

// Run the problem analyzer to break down the problem into steps
const [analysisHistory, analysisOutput] = await problemAnalyzer.run(analysisMessages);

// Pass the analysis plan to the calculator agent for execution
const calculationMessages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: 
      "Execute this calculation plan: " +
      analysisOutput  // Insert the step-by-step plan from stage 1
  }
];

// Run the calculator agent to perform all mathematical operations
let [calculationHistory, calculationOutput] = await calculatorAgent.run(calculationMessages);

// TODO: Add a validation request message to the existing calculationHistory asking the agent to validate its work and respond with only True or False
const validationRequest: Anthropic.MessageParam = {
  role: "user",
  content:
    "Validation request: Review your immediately previous calculation work in this " +
    "conversation and check it for arithmetic correctness and consistency with the " +
    "original plan. Respond with only True or False. No extra words, no punctuation."
};

calculationHistory = [...calculationHistory, validationRequest];

// TODO: Run the calculator agent again using the existing calculationHistory to get the validation response
const [validationHistory, validationOutputRaw] = await calculatorAgent.run(calculationHistory);

// TODO: Check if the validation response contains "True" and store this result in validationPassed
const validationOutput = String(validationOutputRaw).trim();
const normalized = validationOutput.toLowerCase();
const validationPassed = normalized === "true";

// TODO: Print the validation stage results showing the response and whether validation passed
console.log("\n=== VALIDATION STAGE ===");
console.log("Validator response:", validationOutput);
console.log("Validation passed:", validationPassed);

// TODO: Only proceed to create and run the Solution Presenter if validationPassed is true, otherwise print an error message
if (!validationPassed) {
  console.error(
    "\nValidation failed. Stopping pipeline to avoid presenting incorrect results."
  );
  process.exitCode = 1;
  // Stop gracefully (no presenter run)
} else {

// Combine original problem and calculation results for final presentation
const presentationPrompt = 
  "Present this solution clearly based on the original problem and " +
  "calculations:\n\n" +
  `Original Problem: ${complexProblem}\n\n` +    // Provide context
  `Calculation Results: ${calculationOutput}`;  // Include all calculations

// Create the final message for the solution presenter
const presentationMessages: Anthropic.MessageParam[] = [
  { role: "user", content: presentationPrompt }
];

// Run the solution presenter to create the final educational output
const [presentationHistory, presentationOutput] = await solutionPresenter.run(presentationMessages);

// Display the final output
console.log("\n=== PRESENTATION STAGE ===");
console.log(presentationOutput);
}