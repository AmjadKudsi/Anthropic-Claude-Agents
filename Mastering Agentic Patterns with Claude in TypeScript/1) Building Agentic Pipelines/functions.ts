import Anthropic from "@anthropic-ai/sdk";
import { Agent } from './agent';

// Define our complex problem
const complexProblem = 
  "A rectangular garden is 12 meters long and 8 meters wide. " +
  "How much fencing is needed to go around the perimeter? " +
  "Also, if grass seed is needed at a rate of 0.25 kg per square meter, " +
  "how much grass seed is required for the entire garden?";

// TODO: Create the Problem Analyzer Agent with a system prompt that tells it to break down problems into steps without doing calculations

// Create the initial message with the complex problem for the analyzer
const analysisMessages: Anthropic.MessageParam[] = [
  { role: "user", content: complexProblem }
];

// TODO: Run the problem analyzer agent with the analysis_messages to break down the problem into steps

// TODO: Print the analysis output to see how the agent breaks down the problem