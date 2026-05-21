import { Entity } from "./entity";
import * as readline from "readline";


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
    mood: "completely drained and unmotivated. I want to go to bed but it's too early.",
    activity: "relaxing",
};

let event = {
    "source": "Jack",
    "type": "dialogue",
    "content": "Don't tell me you forgot to buy groceries today.",
    "attributes": [
        "jack says this while still watching tv",
        "jack seems annoyed",
    ]
}

// alice.reactToEvent(JSON.stringify(event), current_context).then((response) => {
//     console.log("Alice's reaction to the event:", response);
// }).catch((error) => {
//     console.error("Error generating Alice's reaction:", error);
// });