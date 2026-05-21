import { Type } from "@google/genai";
import { BaseAgent, minimalLLMCall } from "./gemini";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";

interface AffectVector {
    [key: string]: number;
}


type LedgerEntry = {
    event: string;
    affect_vector: AffectVector;
};


export class Entity extends BaseAgent {
    name: string;
    description: string;
    ledger: LedgerEntry[];
    relations: { [key: string]: Entity };

    constructor(name: string, description: string, relations: { [key: string]: Entity } = {}) {
        super();
        this.name = name;
        this.description = description;
        this.ledger = [];
        this.relations = relations;
    }

    reactToEvent(event: string, context: any) {
        let prompt: string = this.promptBuilder(context) + `\n\nThe following event just happened: ${event}\n\n. I can either react by saying something or doing something if it requires a reaction. What do I do?`;

        return this.generateIntent(prompt);
    }

    static reactionParser(narrated_event: string): any {
        // schema is a list of event objects in chronological order.
        const schema = z.array(z.object({
            source: z.string().describe("Who or what caused the event"),
            type: z.string().describe("Type of the event, e.g. dialogue, action, internal thought, etc."),
            content: z.string().describe("Text content of the event"),
            attributes: z.array(z.string()).describe("List of attributes describing the event, e.g. 'Jack says this while still watching tv', 'Jack seems annoyed', etc."),
        }));

        const jsonSchema = zodToJsonSchema(schema);

        const instruction = `Parse the following narrated event into a structured format according to the provided schema.`;

        return minimalLLMCall(instruction, narrated_event, jsonSchema);
    }

    recordEvent(event: string, affect_vector: AffectVector) {
        this.ledger.push({ event, affect_vector });
    }

    AddLedgerEntryFunctionDeclaration = {
        name: "add_ledger_entry",
        description: "Add a new entry to the ledger of past events. Each entry includes a text description of the event and an affect vector with the following dimensions: joy/distress, hope/fear, pride/shame, gratitude/anger, arousal, dominance, social.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                event: {
                    type: Type.STRING,
                    description: "The text description of the event."
                },
                affect_vector: {
                    type: Type.OBJECT,
                    properties: {
                        "joy/distress": { type: Type.NUMBER, description: "Positive values indicate joy, negative values indicate distress." },
                        "hope/fear": { type: Type.NUMBER, description: "Positive values indicate hope, negative values indicate fear." },
                        "pride/shame": { type: Type.NUMBER, description: "Positive values indicate pride, negative values indicate shame." },
                        "gratitude/anger": { type: Type.NUMBER, description: "Positive values indicate gratitude, negative values indicate anger." },
                        "arousal": { type: Type.NUMBER, description: "Positive values indicate arousal, negative values indicate calm." },
                        "dominance": { type: Type.NUMBER, description: "Positive values indicate dominance, negative values indicate submission." },
                        "social": { type: Type.NUMBER },
                    },
                },
            },
        },
    };

    promptBuilder(current_context: any): string {
        let promptString = `I am ${this.name}. ${this.description}.\n\n`

        // add relations
        if (Object.keys(this.relations).length > 0) {
            promptString += `I have the following relations:\n`;
            for (const [relation, entity] of Object.entries(this.relations)) {
                promptString += `- ${relation}: ${entity.name}\n`;
            }
            promptString += `\n`;
        }

        // add recent events
        if (this.ledger.length > 0) {
            promptString += `Recently, I have experienced the following events:\n`;
            for (const entry of this.ledger.slice(-5)) { // only include last 5 events
                promptString += `- ${entry.event} (affect vector: ${JSON.stringify(entry.affect_vector)})\n`;
            }
            promptString += `\n`;
        }

        // add current context
        promptString += `Currently, I am in the following context: ${JSON.stringify(current_context)}\n\n`;

        return promptString;
    }
}

