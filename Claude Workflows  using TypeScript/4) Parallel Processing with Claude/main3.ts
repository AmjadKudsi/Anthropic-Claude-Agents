# complete the two-phase workflow pattern by adding the crucial aggregation step that transforms your scattered research into a unified, actionable result.

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const client = new Anthropic();

// List of independent questions for Paris trip planning
const questions = [
    "What are the top 3 must-see attractions in Paris?",
    "What is the most efficient way to get around Paris as a tourist?",
    "What are important cultural etiquette tips for visitors to France?"
];

async function askQuestion(question: string): Promise<[string, string]> {
    /**
     * Async function to ask Claude a single question
     */
    console.log(`🔄 Asking: ${question}`);
    
    // Send async request to Claude
    const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: "You are a travel expert. Give brief, helpful answers.",
        messages: [{ role: "user", content: question }]
    });
    
    // Extract the answer
    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        throw new Error(`No text response for question: ${question}`);
    }
    const answer = textBlock.text;
    
    console.log(`✅ Answered: ${question}`);
    
    return [question, answer];
}

// Create an async function that takes the research results as a parameter
    // Combine all Q&A pairs into a formatted research string
    // Send the combined research to Claude with instructions to create a brief, practical travel guide
    // Return the travel guide

async function createTravelGuide(researchResults: [string, string][]): Promise<string> {
    /**
     * Execute parallel research and create comprehensive travel plan
     */
    // Combine all Q&A pairs into a formatted research string
    const formattedResearch = researchResults
        .map(([question, answer], index) => {
            return [
                `Q${index + 1}: ${question}`,
                `A${index + 1}: ${answer}`
            ].join("\n");
        })
        .join("\n\n");    
    
    console.log(`\n📚 Aggregating research into a travel guide...\n`);
    
    // Send the combined research to Claude with clear instructions
    const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: "You are a travel expert. Using the provided research, write a brief, practical travel guide for a first-time visitor to Paris. Focus on clear, actionable advice.",
        messages: [
            {
                role: "user",
                content:
                    "Here is my research as question and answer pairs:\n\n" +
                    formattedResearch +
                    "\n\nPlease turn this into a concise, easy-to-follow Paris travel guide."
            }
        ]
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response when creating travel guide");
    }

    const guide = textBlock.text;
    console.log("🧭 Travel guide created!");
    return guide;
}

async function main() {
    /**
     * Execute parallel research and create comprehensive travel plan
     */
    console.log(`Starting ${questions.length} research questions in parallel...`);

    // Phase 1: execute all research tasks in parallel        
    const results = await Promise.all(
        questions.map(question => askQuestion(question))
    );
    
    console.log("\nResearch completed!");
    
    // TODO: Call your aggregation function with the results and store the return value
    
    // TODO: Print the travel plan with a nice header like "Paris Travel Guide:"
    
    // Phase 2: aggregate results into a single travel guide
    const travelGuide = await createTravelGuide(results);
    
    // Display the final travel guide
    console.log("\n======================");
    console.log("Paris Travel Guide:");
    console.log("======================\n");
    console.log(travelGuide);
}

// Run the parallel workflow
main().catch(err => {
    console.error("❌ Error in main:", err);
});