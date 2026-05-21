# NLAVS

## What are we trying to solve here

The inherent nature of LLM outputs is such that it caters to what the user wants it to output, whether its directly or indirectly. In case of made up RPG scenarios, what ends up happening is that the user input hijacks the story and/or gameplay making the entire thing very predictable as the characters tend to lack any agency. You make a mistake, the character gets angry, you say sorry, the character forgives you. 

This is why I had been experimenting on using external deterministic state machines to bind LLMs so that it doesn't have to leave the metrics of a character's state up for hallucination or vibes.

Something like

```
"state_metrics": {
    "trust": 40,
    "anxiety": 78
    "happiness": 60
}
```

The issue here is that assigning a scalar number like `trust: 40` to a deeply complex human emotion is a legacy mechanic inherited from traditional video games (like RPG alignment sliders). When you pair arbitrary numbers with LLMs the system quickly breaks down mainly because of the fact that these numbers are arbitrary.

Is happiness=40 twice as good as happiness=20? And even if it is twice as much, what does it mean exactly? Besides if you ask an LLM to evaluate a scene and adjust a score, it will completely hallucinate the numbers, leading to erratic, robotic, or illogical character behavior. 

The bottom line is that you cannot let AI judge itself using numerical scales on things that are subjective and non-linear.

So its clear that if I want to build an interactive narrative smulation that feels real consistent without relying on arbitrary numerical scoring, I have to transisiton to some qualitative, structured tracking mechanisms.

_Right?_

## Discrete State Matrices

Instead of tracking emotions on a linear scale of 1 to 100, we can lock the character into pre defined psychological tiers where each tier has a hardcoded, unchangeable set of prompt behaviors that the LLM must obey. (This system also has its quirks and I'll explain why I moved on from this later.)

Instead of writing `trust: 42`, the backend architecture tracks structural relationship status like:

- `[Relationship status: Gaurded]`
- `[Relationship Status: Friendly]`
- `[Relationship Status: Traumatized/Betrayed]`

So considering a case where you shoot a friend in the foot out of the blue the character would be computationally locked into a state of `Trauma/Betrayal`. The system will not allow the status to change just because of a nice sounding dialogue or a simple apology. Basically, we override the AI's tendency to automatically submit to the uer's inputs.

## Fact Ledgers

Unlike solecistic numbers, actions are much more permanent and hold meaning. Even in real life, humans don't measure a relationship by checking an internal points meter; we remember specific concrete events.

So we mantain a permanent, bulleted list of player's narrative crimes. Ever major choice the player makes gets appended to a hidden ledger block that is pinned directly to AI's core memory stack.

When the AI evaluates how an entity should act, it reads the ledger. Because the concrete memory of a action of betrayal or trauma is sitting right there in the prompt, the model is mathematically pushed to maintain a lingering suspicion and resentment even if the player is currently typing something that should positively impact the prompt.

So we have our fact ledger and discrete state matrices to define the current state of the entity. Both of these things impact the next actions of the entity. But this still has some limitations. 

changes in emotions are not always in discrete steps, its continous, so we need to preserve that gradient information. Flattening that information into discrete steps decreases how accurately we are simulating emotional intelligence. But if we want to store numbers, we again run into the same problem of self-grading as we talked about above. 

But what if, this time instead of letting the AI directly determine numbers to "grade" the entity's state, we compute it mathematically?

We are already keeping a track of actions that happen to the entity in a ledger, so, what we can try and do is to let AI assign a micro-score to the delta of how that action would transform the current mood state.

While LLMs are terrible at macro-arithmetic (like tracking state over time) they aren't half bad at micro-evaluations (like parsing a moment). We let the LLM calculate a vector for a single action once, and let the math handle continuous aggragation, we get the best of both worlds. We now might have a system thats both continuous nuanced state gradients but without the AI memory drift.

## Affective Vector Space

I have noticed that entities frequently display conflicting emotions. Like taking up our previous example, "friend A" can be furious about the stray cat, yet be grateful about sharing a candy bar. On a traditional linear slider, positive and negative numbers cancel each other out ( $+5 Affection - 5 Anger = 0 Neutral$ ) which basically makes the AI act like a robot with Amnesia.

With our vector approach, a character can possess simultaneously high anger and high affection:

$$V_{state} = [ \text{Happiness}: - 4, \text{Anger}: + 8, \text{Affection}: + 7 ]$$

### Aggregation using Decay and Attention

If we simply add up every vector in the ledger forever, the entity's emotions will eventually max out at +10 or -10 and freeze. So instead of that, the entity's current active mood vector $M_{active}$ at any given time can be calculated by:

$$M_{active} = M_{\text{baseline}} + \sum_{i=1}^{n} (V_i \cdot w_i \cdot d_i) $$

$\vec{M}_{\text{baseline}}$ is the character's default resting personality or previous current state

$\vec{V}_i$ is the emotional vector of a specific fact in the ledger book.

$d_i$ is the Decay Multiplier (Time-based). Every turn that passes, an old event's vector shrinks closer to $0$. A petty argument decays in 5 turns; a massive betrayal takes 500 turns to decay.

$w_i$ is the Attention Weight (Memory Activation). If a fact is not currently being talked about, its weight drops to $0.1$. But if the player suddenly brings up an old trauma, the system instantly spikes that event's attention weight $w_i$ back to $1.0$.

## Deciding on the Vector Tracking Axes

For this, I thought it would be a good idea to read up on the OCC model of emotions which categorizes 22 emotions based on cognition. Now, using all those 22 emotions as-is would probably be a very naive way of approaching things here. What we are going to do is to simplify them into valences.  

Here's what I consider to be a reasonable minimal OCC-derived set:

| Emotion              | Valence | OCC Source                        |
|----------------------|---------|-----------------------------------|
| Joy                  | +       | desirable event happened          |
| Distress             | −       | undesirable event happened        |
| Hope                 | +       | desirable event anticipated       |
| Fear                 | −       | undesirable event anticipated     |
| Pride / Satisfaction | +       | own action judged well            |
| Shame / Remorse      | −       | own action judged poorly          |
| Gratitude            | +       | other's action benefited you      |
| Anger                | −       | other's action harmed you         |

Other than that we also parameterize this into 3 other dimensions:

- Arousal: Tracks High Energy vs. Low Energy. Helps us distinguish sharp distress from a quiet reflective melancholy.
- Dominance: High positive values denote feeling powerful, safe and in control while low values denote feeling helpless or overwhelmed.
- Social Drive: Tracks the instict to socially interact with others or the desire to isolate or reject.