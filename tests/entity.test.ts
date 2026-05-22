import { describe, beforeEach, test, expect, vi } from "vitest";
import { Entity } from "../src/entity";

describe("Entity.reactionParser", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    // TODO: Allow arbitrary values. Only check structure.

    test("forwards the narrated event and returns the parsed result from minimalLLMCall", async () => {
        const mockResult = [
            {
            },
        ];

        // Mock dependencies before importing modules that depend on them
        vi.doMock("./gemini", () => {
            return {
                BaseAgent: class { },
                minimalLLMCall: vi.fn().mockResolvedValue(mockResult),
            };
        });
        vi.doMock("@google/genai", () => {
            return { Type: { OBJECT: "object", STRING: "string", NUMBER: "number" } };
        });


        const narratedEvent = `I slowly close my book, the weight of the entire day pressing down on my shoulders. I look over at the back of Jack's head, waiting for him to actually look at me, but his eyes stay glued to the TV screen. 
"I did," I say, my voice flat and completely devoid of energy. "Emily had another tantrum, I got a speeding ticket trying to make up time, and I was late for my lessons. I had a horrible day, Jack. I'm exhausted. If you're hungry, please just order something."
I set the book on the side table and stand up, not waiting for his response. I don't care if it's too early; I can't sit here in this silence anymore. 
"I'm going to bed," I tell him, already walking toward the stairs.`

        const result = await Entity.reactionParser(narratedEvent);

        // ensure the mocked minimalLLMCall result is returned unchanged
        expect(result).toEqual(mockResult);

        // ensure minimalLLMCall was called with expected args
        const gemini = await import("../src/gemini");
        expect((gemini as any).minimalLLMCall).toHaveBeenCalledTimes(1);
        const [instructionArg, narratedArg, jsonSchemaArg] =
            (gemini as any).minimalLLMCall.mock.calls[0];

        expect(typeof instructionArg).toBe("string");
        expect(instructionArg).toMatch(/Parse the following narrated event into a structured format/);
        expect(narratedArg).toBe(narratedEvent);
        expect(jsonSchemaArg).toBeDefined();
    }, 20000);
});