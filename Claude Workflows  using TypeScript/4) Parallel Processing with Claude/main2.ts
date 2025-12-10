// Replace the sequential for loop with parallel task creation using array mapping
// Use Promise.all() to execute all tasks simultaneously.

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

async function askQuestion(question: string): Promise<string> {
    console.log(`🔄 Asking: ${question}`);
    
    // Send async request to Claude
    const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: "You are a travel expert. Give brief, helpful answers.",
        messages: [{ role: "user", content: question }]
    });
    
    // Extract and return the answer with type checking
    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response");
    }
    const answer = textBlock.text;
    console.log(`✅ Answer received!`);
    
    return answer;
}

async function main() {
    // List of independent questions for Paris trip planning
    const tasks = [
        askQuestion("What are the top 3 must-see attractions in Paris?"),
        askQuestion("What is the most efficient way to get around Paris as a tourist?"),
        askQuestion("What are important cultural etiquette tips for visitors to France?")
    ];
    
    // TODO: Execute the tasks in parallel using Promise.all() with array mapping
    const results = await Promise.all(tasks);
    
    // Display all results
    console.log(results)
}

// Run the parallel workflow
main();