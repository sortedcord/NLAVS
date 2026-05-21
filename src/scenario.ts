import { Entity } from "./entity";
import { GoogleGenAI } from "@google/genai";
import * as readline from "readline";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// create an entity
export const alice = new Entity(
    "Alice",
    "I'm 32 years old, mother of two. I'm currently working as a piano teacher at a local middle school. My days are mostly the same and life seems to have stagnated for me. I've been married to my husband Jack for 10 years. He's great and we don't fight, but we don't look forward to spending time together either."
);

// record some events
alice.recordEvent("Emily, my daughter threw a tantrum again in the morning. I don't know what to do anymore.", {
    "joy/distress": -2,
    "hope/fear": 0,
    "pride/shame": 0,
    "gratitude/anger": -1,
    "arousal": -2,
    "dominance": -3,
    "social": 0,
});
alice.recordEvent("Ended up getting a speeding ticket on my way to school for lessons. Happened because I got late trying to get Emily ready.", {
    "joy/distress": -2,
    "hope/fear": 0,
    "pride/shame": -2,
    "gratitude/anger": -1,
    "arousal": -2,
    "dominance": -2,
    "social": -1,
});

alice.recordEvent("Didn't reach class on time today. Had to apologize to my students and the coordinator. I feel so embarrassed.", {
    "joy/distress": -3,
    "hope/fear": 0,
    "pride/shame": -3,
    "gratitude/anger": 0,
    "arousal": -2,
    "dominance": -3,
    "social": -3,
});

let current_context = {
    location: "home",
    time: "evening",
    social: "with Jack, my husband. He's on the couch watching TV while I'm reading a book.",
    activity: "relaxing",
};

// In-memory conversation history. Each entry: { speaker: 'Jack'|'Alice', text: string }
const conversationHistory: Array<{ speaker: string; text: string }> = [];

// Helper: build the system instruction sent to the model
function buildSystemInstruction(): string {
    const ledgers = alice.ledger
        .slice(-10)
        .map((entry) => `- ${entry.event} (affect vector: ${JSON.stringify(entry.affect_vector)})`)
        .join("\n");

    const convoText = conversationHistory
        .slice(-12)
        .map((c) => `${c.speaker}: ${c.text}`)
        .join("\n");

    return (
        alice.description +
        "\n\n" +
        "Here are some of the recent events in my life and how they made me feel:\n" +
        ledgers +
        "\n\n" +
        "Current context: " +
        JSON.stringify(current_context) +
        "\n\n" +
        "Conversation so far:\n" +
        convoText +
        "\n\n" +
        "Given all this information, please respond as Alice in a way that is consistent with her character and current emotional state. Keep the reply brief and in first person."
    );
}

async function askAlice(jackLine: string) {
    // append Jack's utterance
    conversationHistory.push({ speaker: "Jack", text: jackLine });

    const systemInstruction = buildSystemInstruction();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Jack says to me: "${jackLine}"`,
            config: {
                systemInstruction,
            },
        });

        const aliceReply = response.text?.trim() ?? "(no response)";
        conversationHistory.push({ speaker: "Alice", text: aliceReply });
        console.log(`Alice: ${aliceReply}`);
    } catch (err: any) {
        console.error("Error calling AI:", err?.message ?? err);
        console.log("Alice: (failed to generate reply)");
    }
}

async function main() {
    console.log("Interactive dialogue. Type as Jack. Commands: /exit to quit, /history to show conversation history.");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "Jack: ",
    });

    rl.prompt();

    rl.on("line", async (line) => {
        const trimmed = line.trim();
        if (trimmed === "/exit") {
            rl.close();
            return;
        }
        if (trimmed === "/history") {
            console.log("--- Conversation history ---");
            conversationHistory.forEach((c) => console.log(`${c.speaker}: ${c.text}`));
            console.log("---------------------------");
            rl.prompt();
            return;
        }

        // Send to AI and wait for reply before prompting again
        await askAlice(trimmed);
        rl.prompt();
    });

    rl.on("close", () => {
        console.log("Goodbye.");
        process.exit(0);
    });
}

main();