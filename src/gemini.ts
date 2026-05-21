import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import zodToJsonSchema from "zod-to-json-schema";
import { createAgent, providerStrategy } from "langchain";
import { Result } from "postcss";
import { ZodAny } from "zod";


const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
});

export async function minimalLLMCall(instruction: string, prompt: string, zodschema: ZodAny): Promise<any> {

    const structuredLlm = llm.withStructuredOutput(zodschema);
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

        const systemInstructionPrompt = `This is an advanced world simulation engine. 
        You are to behave as the entity you were assigned would as realistically as 
        possible. Your responses are real, not perfect. Do not be overly dramatic 
        unless that is the goal. Always respond in first person.`

        const messages = [
            { role: 'system', content: systemInstructionPrompt },
            { role: 'user', content: prompt },
        ];

        const res = await (llm as any).generate(messages);
        const text = (res?.generations?.[0]?.[0]?.text) || (res?.generations?.[0]?.text) || res?.text;
        return text ?? "";
    }
}