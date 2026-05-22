import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ZodAny } from "zod";


const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash",
});

export async function generateStructured(instruction: string, prompt: string, zodschema: ZodAny): Promise<any> {
    const llm_ = new ChatGoogleGenerativeAI({
        model: "gemini-3.1-flash-lite",
    });

    const structuredLlm = llm_.withStructuredOutput(zodschema);
    const messages = [
        { role: 'system', content: instruction },
        { role: 'user', content: prompt },
    ];

    const response = await structuredLlm.invoke(messages);
    return response;
}

interface IAgent {
    generateIntent(prompt: string): Promise<string>;
}

export abstract class BaseAgent implements IAgent {
    async generateIntent(prompt: string): Promise<string> {
        /**
         * Returns the narrated response by an entity to the built prompt.
         */

        const systemInstructionPrompt = `This is an advanced world simulation engine. 
        You are to behave as the entity you were assigned would as realistically as 
        possible. Your responses are real, not perfect. Do not be overly dramatic 
        unless that is the goal. Always respond in first person. Do not repeat events.`

        const messages = [
            { role: 'system', content: systemInstructionPrompt },
            { role: 'user', content: prompt },
        ];

        // TOKEN STATS 
        console.log(`System instruction token count: ${await (llm as any).getNumTokens(systemInstructionPrompt)}`);
        console.log(`Prompt token count: ${await (llm as any).getNumTokens(prompt)}`);

        const res = await llm.invoke(messages);
        const text = (res?.generations?.[0]?.[0]?.text) || (res?.generations?.[0]?.text) || res?.text;
        return text ?? "";
    }
}