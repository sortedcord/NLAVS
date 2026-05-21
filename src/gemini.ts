import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function minimalLLMCall(instruction: string, prompt: string, schema: any = {}): Promise<string> {
    return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: instruction,
            responseFormat: {
                text: {
                    mimeType: "application/json",
                    schema: schema,
                }
            }
        }
    }).then(response => response.text);
}

interface IAgent {
    generateIntent(prompt: string): Promise<string>;
}

export abstract class BaseAgent implements IAgent {
    async generateIntent(prompt: string): Promise<string> {

        const systemInstructionPrompt = `This is an advanced world simulation engine. 
        You are to behave as the entity you were assigned would as realistically as 
        possible. Your responses are real, not perfect. Do not be overly dramatic 
        unless that is the goal. Always respond in first person.`

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstructionPrompt
            }
        });
        return response.text;
    }
}