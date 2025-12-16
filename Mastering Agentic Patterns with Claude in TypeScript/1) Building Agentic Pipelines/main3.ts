// complete your three-agent pipeline by building the Solution Presenter Agent — the communication specialist who takes technical calculation results and formats them into clear, comprehensive solutions that anyone can understand

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

// TODO: Create the Solution Presenter Agent with a system prompt that tells it to present calculation results as educational solutions
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
const [calculationHistory, calculationOutput] = await calculatorAgent.run(calculationMessages);

// TODO: Create presentationPrompt that combines the original problem and calculation results for final presentation
const presentationPrompt =
"Present this solution clearly based on the original problem and " +
"calculations:\n\n" +
  `Original Problem: ${complexProblem}\n\n` +    
  `Calculation Results: ${calculationOutput}`;  


// TODO: Create presentationMessages with the presentationPrompt for the solution presenter
const presentationMessages: Anthropic.MessageParam[] = [
  { role: "user", content: presentationPrompt }
];

// TODO: Run the solution presenter agent to create the final educational output
const [presentationHistory, presentationOutput] = await solutionPresenter.run(presentationMessages);

// TODO: Print the presentationOutput to see the complete pipeline result
console.log(presentationOutput);