// build a specialized agent that can analyze the provided garden problem and create a structured, step-by-step plan

import Anthropic from "@anthropic-ai/sdk";
import { Agent } from './agent';

// Define our complex problem
const complexProblem = 
  "A rectangular garden is 12 meters long and 8 meters wide. " +
  "How much fencing is needed to go around the perimeter? " +
  "Also, if grass seed is needed at a rate of 0.25 kg per square meter, " +
  "how much grass seed is required for the entire garden?";

// TODO: Create the Problem Analyzer Agent with a system prompt that tells it to break down problems into steps without doing calculations
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

// TODO: Run the problem analyzer agent with the analysis_messages to break down the problem into steps
const [analysisHistory, analysisOutput] = await problemAnalyzer.run(analysisMessages);

// TODO: Print the analysis output to see how the agent breaks down the problem
console.log(analysisOutput);