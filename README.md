# NLAVS (Non-Linear Affective Vector Space)

A deterministic mathematical framework for giving LLM-driven entities persistent, nuanced, and non-sycophantic emotional states.

## The Problem: Sycophancy and Arbitrary Metrics

The inherent nature of LLM outputs is such that they cater to what the user wants, whether directly or indirectly. In AI-driven RPG scenarios, this results in user input hijacking the story and gameplay, making the experience entirely predictable. Characters lack agency: you make a mistake, the character gets angry; you say sorry, the character forgives you. 

To fix this, developers often experiment with external deterministic state machines to bind LLMs, preventing them from leaving a character's emotional state up to hallucination or "vibes."

```json
"state_metrics": {
    "trust": 40,
    "anxiety": 78,
    "happiness": 60
}
```

The issue here is that assigning a scalar number like `trust: 40` to a deeply complex human emotion is a legacy mechanic inherited from traditional video games (like RPG alignment sliders). When you pair arbitrary numbers with LLMs, the system quickly breaks down. 

Is `happiness: 40` twice as good as `happiness: 20`? And even if it is, what does that mean exactly? If you ask an LLM to evaluate a scene and adjust a score, it will hallucinate the numbers, leading to erratic, robotic, or illogical character behavior. 

**The bottom line:** You cannot let AI judge itself using numerical scales on things that are subjective and non-linear. To build an interactive narrative simulation that feels consistently real, we must transition to a qualitative, structured tracking mechanism that leverages deterministic math over LLM hallucination.

## The Evolution of State Tracking

### 1. Discrete State Matrices
Instead of tracking emotions on a linear scale of 1 to 100, we can lock a character into predefined psychological tiers. Each tier has a hardcoded set of prompt behaviors the LLM must obey. Instead of writing `trust: 42`, the backend tracks structural relationship statuses:

* `[Relationship Status: Guarded]`
* `[Relationship Status: Friendly]`
* `[Relationship Status: Traumatized/Betrayed]`

If a player shoots a friend in the foot out of the blue, the character is computationally locked into `Trauma/Betrayal`. The system will not allow the status to change just because of a nice-sounding dialogue or a simple apology. We override the AI's tendency to automatically submit to user inputs. 

*Limitation:* Human emotional changes are not always discrete steps; they are continuous. Flattening this gradient into discrete steps decreases the accuracy of the emotional intelligence simulation.

### 2. Fact Ledgers
Unlike arbitrary numbers, actions are permanent and hold meaning. Humans don't measure a relationship by checking an internal points meter; we remember specific concrete events. 

We maintain a permanent, bulleted list of the player's narrative actions. Every major choice gets appended to a hidden ledger block pinned directly to the AI's core memory stack. When the AI evaluates how to act, it reads the ledger. Because the concrete memory of a betrayal is sitting right there in the prompt, the model is mathematically pushed to maintain lingering suspicion, even if the player is currently typing something positive.

### 3. Micro-Evaluations vs. Macro-Arithmetic
To get continuous, nuanced state gradients without AI memory drift, we separate the evaluation from the aggregation. 

While LLMs are terrible at macro-arithmetic (tracking state over time), they are excellent at micro-evaluations (parsing a single moment). We let the LLM calculate a vector for a single action *once*, and let deterministic math handle the continuous aggregation.

## Affective Vector Space

Entities frequently display conflicting emotions. A friend can be furious about a stray cat, yet grateful about sharing a candy bar. On a traditional linear slider, positive and negative numbers cancel each other out (`+5 Affection - 5 Anger = 0 Neutral`), making the AI act like a robot with amnesia.

With our vector approach, a character can possess simultaneously high anger and high affection:

$$ V_{state} = [ \text{Joy}: -4, \text{Anger}: +8, \text{Affection}: +7 ] $$

### Aggregation using Decay and Attention
If we simply add up every vector in the ledger forever, an entity's emotions will eventually max out at +10 or -10 and freeze. Instead, the entity's current active mood vector ($M_{active}$) at any given time is calculated by:

$$ M_{active} = M_{\text{baseline}} + \sum_{i=1}^{n} (V_i \cdot w_i \cdot d_i) $$

* **$M_{\text{baseline}}$**: The character's default resting personality state.
* **$V_i$**: The emotional vector of a specific fact in the ledger.
* **$d_i$ (Decay Multiplier)**: Time-based. Every turn that passes, an old event's vector shrinks closer to $0$. A petty argument decays in 5 turns; a massive betrayal takes 500 turns to decay.
* **$w_i$ (Attention Weight)**: Memory activation. If a fact is not currently being discussed, its weight drops to $0.1$. If the player suddenly brings up an old trauma, the system instantly spikes that event's attention weight back to $1.0$.

## Deciding on the Vector Tracking Axes

To structure these vectors, we look to the OCC model of emotions, which categorizes emotions based on cognition. Using all 22 OCC emotions as-is is too complex for a computational matrix. Instead, we simplify them into core valences.

Here is a reasonable minimal OCC-derived set:

| Emotion | Valence | OCC Source |
| :--- | :---: | :--- |
| Joy | + | Desirable event happened |
| Distress | − | Undesirable event happened |
| Hope | + | Desirable event anticipated |
| Fear | − | Undesirable event anticipated |
| Pride / Satisfaction | + | Own action judged well |
| Shame / Remorse | − | Own action judged poorly |
| Gratitude | + | Other's action benefited you |
| Anger | − | Other's action harmed you |

To capture the full psychological picture, we parameterize these valences into three additional dimensions (borrowing from the PAD emotional state model):

* **Arousal:** Tracks High Energy vs. Low Energy. Distinguishes sharp distress from quiet, reflective melancholy.
* **Dominance:** High positive values denote feeling powerful, safe, and in control. Low values denote feeling helpless or overwhelmed.
* **Social Drive:** Tracks the instinct to socially interact versus the desire to isolate or reject.

## Personality Vectors: Modifiers and Susceptibility

Different people have different personalities, which introduces **susceptibility**. Some people are inherently more susceptible to anger, happiness, or excitement than others. 

To simulate this, NLAVS introduces a **Personality Susceptibility Vector ($S$)**. This is a hardcoded, permanent multiplier applied to incoming events *before* they are added to the ledger and aggregated. 

Instead of letting every character react identically to the same stimulus, $S$ warps the incoming emotional vector ($V_{raw}$) to fit the character's unique psychology.

### The Susceptibility Transformation
When an event occurs, the LLM generates the "objective" emotional weight of the action ($V_{raw}$). Before this is committed to the ledger, it is multiplied element-wise by the character's Susceptibility Vector:

$$ V_{processed} = V_{raw} \odot S $$

(Where $\odot$ represents the Hadamard product, or element-wise multiplication).

**Example:**
* A player gives Character A and Character B a thoughtful gift. 
* The LLM evaluates the action and outputs a raw vector: `V_raw = [Joy: +2, Gratitude: +3]`
* **Character A (Cynical/Grumpy):** Has a low susceptibility to Joy and Gratitude (`S = [Joy: 0.5, Gratitude: 0.5]`). Their processed vector becomes `[Joy: +1, Gratitude: +1.5]`. They appreciate it, but begrudgingly.
* **Character B (Optimistic/Eager):** Has a high susceptibility (`S = [Joy: 1.5, Gratitude: 2.0]`). Their processed vector becomes `[Joy: +3, Gratitude: +6]`. They are elated.

### Updating the Master Equation
Because $S$ permanently alters how a specific character perceives reality, it acts as a gateway to the Fact Ledger. The aggregated master equation is updated to reflect this:

$$ M_{active} = M_{\text{baseline}} + \sum_{i=1}^{n} \big((V_{raw_i} \odot S) \cdot w_i \cdot d_i\big) $$

Furthermore, $S$ can also contain negative values for neurotic traits. If a character is highly paranoid, their susceptibility to `Anger` or `Fear` might be `1.8`, meaning a minor slight (`V_raw = [Anger: +1]`) is perceived by them as a massive slight (`V_processed = [Anger: +1.8]`), while a positive action might be dulled. 

By introducing $S$, we ensure that the same player action yields dramatically different emotional trajectories depending on *who* they are interacting with, organically enforcing character consistency without requiring the LLM to remember "how this character would react."

## Architectural Formalization: Bypassing the Prompt

If we rely solely on text-based system prompts to enforce emotional state (e.g., injecting `[Mood: Angry, 8]` into the context window), we hit a hard paradox: **we are using a tool that is bad at quantized evaluation to generate the very quantized values we need, and then asking it to interpret those values correctly.** 

Even in micro-evaluations, asking an LLM to spit out `Joy: +2` relies on its "vibes." Over thousands of turns, this micro-hallucination compounds. Furthermore, the system prompt is just text. If a user is manipulative enough, the LLM will statistically drift toward sycophancy, ignoring the prompt's emotional constraints.

To achieve true determinism, NLAVS must operate as a neuro-symbolic architecture. The LLM is removed from the arithmetic entirely and relegated to the role of a classifier, while the mathematical state is enforced directly within the transformer's latent space.

### 1. The Input Paradox: Categorical Gradients
LLMs are terrible at generating consistent scalar numbers, but they are exceptionally good at semantic classification. 

Instead of prompting the LLM to evaluate the arithmetic of an action (`Rate the joy from 1 to 10`), NLAVS requires the LLM to classify the action into a discrete, hardcoded gradient tier.

**Prompt Directive to LLM:** `Classify the action 'gave a candy bar' into one of the following categories: [Minor_Positive, Moderate_Positive, Major_Positive, Neutral, Minor_Negative, Moderate_Negative, Major_Negative].`

**LLM Output:** `Minor_Positive`

The deterministic backend intercepts this string. The LLM's job is over. The backend then maps `Minor_Positive` to a hardcoded, pre-defined vector: `V_raw = [Joy: +1.5, Gratitude: +2.0]`. 

The LLM is no longer hallucinating numbers; it is simply categorizing semantics, and the deterministic engine handles the math.

### 2. The Output Paradox: Latent Steering Vectors
Once the backend computes the active mood state ($M_{active}$) using the aggregation formula, how do we guarantee it affects the output? We do not stringify it into the prompt. Instead, because we are utilizing open-weight models via HuggingFace, we apply $M_{active}$ as a **Steering Vector** (Representation Engineering) directly into the transformer's forward pass.

Transformers generate text by passing token embeddings through multiple layers, accumulating context in a "residual stream." We can mathematically alter this stream during inference.

1. **Vector Preparation:** The computed $M_{active}$ (e.g., `[Anger: +8, Joy: -4, Social_Drive: -6]`) is projected into the model's hidden dimension space using a trained projection matrix.
2. **Residual Stream Injection:** During inference, at a specific, targeted transformer layer (e.g., layer 15 of a 32-layer model), the backend intercepts the residual stream.
3. **Mathematical Enforcement:** The projected $M_{active}$ vector is added directly to the hidden states:
   $$ h_{modified} = h_{original} + \lambda \cdot \text{Project}(M_{active}) $$
   *(Where $\lambda$ is a scaling factor to prevent token degeneration).*

**The Result:** The model literally "feels" the anger at a computational level. Its internal semantic activations are nudged toward hostility and rejection concepts *before* it even processes the user's text or generates the first word. Sycophancy is bypassed entirely because the emotional state is no longer a suggestion in the context window; it is a mathematical alteration of the model's neural pathways.

---

### Afternote: Soft Prompts (For Closed APIs)
If this architecture were to be adapted for closed APIs (like OpenAI or Anthropic) where white-box access to the residual stream is unavailable, we can fall back to **Continuous Embeddings (Soft Prompts)**. 

Instead of injecting $M_{active}$ into the residual stream, the backend maps the vector to a set of continuous, pre-trained embedding tensors. These tensors are prepended to the user's input at the embedding level, bypassing the text tokenizer entirely. The transformer processes these abstract mathematical vectors as if they were foundational context, enforcing the state without relying on easily manipulated text strings.
