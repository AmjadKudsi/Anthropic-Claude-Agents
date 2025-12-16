// build the second stage of your agentic pipeline — a specialized Calculator Agent that takes the structured analysis plan and performs all the mathematical operations using the available tools
// This agent needs to be equipped with the right tools and given clear instructions about its role in the pipeline.

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

// Define our complex problem
const complexProblem = 
  "A rectangular garden is 12 meters long and 8 meters wide. " +
  "How much fencing is needed to go around the perimeter? " +
  "Also, if grass seed is needed at a rate of 0.25 kg per square meter, " +
  "how much grass seed is required for the entire garden?";

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

// Create the initial message with the complex problem for the analyzer
const analysisMessages: Anthropic.MessageParam[] = [
  { role: "user", content: complexProblem }
];

// Run the problem analyzer to break down the problem into steps
const [analysisHistory, analysisOutput] = await problemAnalyzer.run(analysisMessages);

// TODO: Create the Calculator Agent with a system prompt that tells it to execute calculations using math tools
const calculatorAgent = new Agent({
  name: "calculator_agent",
  systemPrompt:
  "You are a calculator agent. Your job is to:\n" +
  "1. take a step-by-step calculation using your available math tools\n" +
  "2. Execute each calculation using your available math tools\n" +
  "3. Show your work clearly for each step\n" +
  "4. Provide the numeical results in a structured format",
  tools: mathTools,
  toolSchemas: toolSchemas
});

// TODO: Create calculationMessages by combining a prompt with the analysisOutput from stage 1
const calculationMessages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content:
    "Execute this calculation plan: " +
    analysisOutput
  }
];

// TODO: Run the calculator agent with the calculationMessages to get the calculation results
const [calculationHistory, calculationOutput] = await calculatorAgent.run(calculationMessages);

// TODO: Print the calculationOutput to see the mathematical execution results
console.log(calculationOutput)