import { Type } from "@google/genai";
import { BaseAgent, generateStructured } from "./gemini";
import z from "zod";

interface AffectVector {
    [key: string]: number;
}

export type Event = {
    source: string;
    type: 'dialogue' | 'action' | 'thought';
    content: string;
    attributes: string[];
}

type LedgerEntry = {
    event: string;
    affect_vector: AffectVector;
};

function ObjectToEvent(obj: any): Event | null {
    if (typeof obj !== 'object' || obj === null) {
        console.error("Input is not a valid object.");
        return null;
    }

    const { source, type, content, attributes } = obj;

    if (typeof source !== 'string' || typeof type !== 'string' || typeof content !== 'string' || !Array.isArray(attributes)) {
        console.error("Object does not match the Event structure.");
        return null;
    }

    if (type !== 'dialogue' && type !== 'action' && type !== 'thought') {
        console.error(`Invalid event type: ${type}`);
        return null;
    }

    if (!attributes.every((a: any) => typeof a === 'string')) {
        console.error("Attributes must be an array of strings.");
        return null;
    }

    return { source, type, content, attributes };
}

export class Entity extends BaseAgent {
    name: string;
    description: string;
    ledger: LedgerEntry[];
    relations: { [key: string]: Entity };
    narrationBuffer: Event[];

    constructor(name: string, description: string, relations: { [key: string]: Entity } = {}) {
        super();
        this.name = name;
        this.description = description;
        this.ledger = [];
        this.relations = relations;
        this.narrationBuffer = [];
    }

    addToNarrationBuffer(eventOrEvents: Event | Event[]) {
        if (Array.isArray(eventOrEvents)) {
            for (const event of eventOrEvents) {
                this.narrationBuffer.push(event);
            }
        } else {
            this.narrationBuffer.push(eventOrEvents);
        }
    }

    async reactToEvent(eventOrEventsToReactTo: Event | Event[], context: any) {
        this.addToNarrationBuffer(eventOrEventsToReactTo);

        let prompt: string = this.promptBuilder(context) + `I can either just think or react by saying something or doing something if it warrants a reaction. What do I do?`;
        let response = await this.generateIntent(prompt);

        let parsedResponse = await Entity.reactionParser(response);
        this.addToNarrationBuffer(parsedResponse);

        return response;
    }

    static async reactionParser(narrated_event: string): Promise<Event[]> {
        // schema is a list of event objects in chronological order.
        const schema = z.array(z.object({
            source: z.string().describe("Who or what caused the event"),
            type: z.enum(['dialogue', 'action', 'thought']),
            content: z.string().describe("Text content of the event"),
            attributes: z.array(z.string()).describe("List of attributes/modifiers describing the action. Add adjectives, modifiers to enrich the description. NOTE: An action accompanied by a dialogue should be separate events."),
        }));

        const instruction = `Parse the following narrated event into a structured format according to the provided schema.`;

        const result = await generateStructured(instruction, narrated_event, schema);

        // convert to Event type

        const events = result.map((item: any) => ObjectToEvent(item)).filter((event: Event | null) => event !== null);

        return events;
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
            promptString += `I have experienced the following events:\n`;
            for (const entry of this.ledger.slice(-5)) { // only include last 5 events
                promptString += `- ${entry.event} (affect vector: ${JSON.stringify(entry.affect_vector)})\n`;
            }
            promptString += `\n`;
        }

        // add narration buffer
        if (this.narrationBuffer.length > 0) {
            promptString += `Currently in this context:\n`;
            for (const event of this.narrationBuffer) { // only include last 5 narrated events
                promptString += `- ${event.source} ${event.type}: ${event.content} (attributes: ${event.attributes.join(", ")})\n`;
            }
            promptString += `\n`;
        }

        // add current context
        promptString += `Currently, I am in the following context: ${JSON.stringify(current_context)}\n\n`;

        return promptString;
    }
}

