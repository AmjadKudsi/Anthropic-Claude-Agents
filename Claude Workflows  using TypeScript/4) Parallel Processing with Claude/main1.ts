// convert this simple program with an askQuestion function that queries Claude to use async patterns

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// TODO: Make this function async and add return type annotation
async function askQuestion(question: string): Promise<string>{
    console.log(`🔄 Asking: ${question}`);
    
    // TODO: Add await before this API call
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

// TODO: Make this function async
async function main() {
    // Question for input
    const question = "What are the top 3 must-see attractions in Paris?";
    
    // TODO: Add await before this function call
    const answer = askQuestion(question);
    
    console.log(`\nFinal Answer: ${answer}`);
}

// Run the function
main().catch(err => {
    console.error("❌ Error in main:", err);
});