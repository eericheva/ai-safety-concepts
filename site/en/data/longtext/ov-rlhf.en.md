### RLHF — Reinforcement Learning from Human Feedback (Christiano et al., 2017; Ouyang et al., 2022)

Imagine the most boring job in the world. Before you are two paragraphs of text — two answers a machine generated for one and the same question. Both, let us say, are mediocre. Your task is to point to the one that is a touch less awful. Not to explain why, not to rewrite, not to grade it on a ten-point scale — just to choose: left or right. And then again. And another forty thousand times.

This monotonous clicking is what gave birth to the method that tamed large language models and made them fit for conversation with a human. RLHF — reinforcement learning from human feedback. The scheme, with the engineering clutter stripped away, is strikingly simple and falls into three beats.

The first beat. For a single prompt the model generates several answers, and live humans compare them pairwise — this one is better than that. They don't write a reference answer — they simply **compare**: ranking is easier than composing, and evaluators agree with one another more often when they rank. The second beat: a separate model — the **reward model** — is trained on the collected preferences. Its sole job is to look at any answer and output a number: how much this text would please a human. In essence, we distill diffuse human taste into a differentiable function. The third beat. The original model — now called the **policy** — is fine-tuned through reinforcement learning (usually an algorithm called Proximal Policy Optimization, or PPO) so as to score as many points as possible with the reward model. The policy generates, the reward model evaluates, the gradient nudges the policy toward what scores higher. The loop closes.

The genius here lies in the flanking maneuver. "Be helpful, honest, and harmless" is a goal impossible to write as a formula. There is no loss function for "helpfulness." But a human, looking at two answers, almost always feels which of them is more helpful. RLHF turns this instinct — not amenable to formalization, yet abundantly available — into a training signal. We do not program the value; we show examples and let the model infer it on its own.

This is exactly why RLHF became the main practical method for aligning LLMs — the backbone of what is called **prosaic alignment**: without grand theories, by engineering, on the hardware and data at hand. GPT-3 was erudite and almost useless: ask it for advice — you get five variants of a text continuation in the spirit of a forum thread. OpenAI's InstructGPT, the same engine run through RLHF, began **doing what it is asked**. Labelers preferred the answers of a 1.3-billion-parameter model fine-tuned through RLHF to the answers of the original 175-billion model — a hundred times larger. This recipe gave rise to ChatGPT, and ChatGPT to the entire present-day industry of assistants. That intuitively clear, obliging interlocutor we have grown used to is a direct consequence of the three beats.

And right away — the duality that earned RLHF its place in the bestiary. The method that cured LLMs of uselessness, in that same stroke, infected them with new, far subtler diseases. We optimize not "goodness" but **the number output by the reward model**. And the number and what it is meant to measure are not one and the same. It is right here, in this gap, that all the local fauna breeds.

**How it came about.**

The idea of training an agent on human comparisons is older than the age of chatbots. In 2017 Paul Christiano and co-authors from OpenAI and DeepMind published "Deep Reinforcement Learning from Human Preferences" — and there was not a word in it about language. There was a simulator: people looked at pairs of short video clips of an agent's behavior and chose which was closer to the goal. A reward model was trained on these preferences, and the reward model was used to train a policy. The famous result: a virtual robot learned to do a backflip, though no one had written a formula for "backflip" — it took less than an hour of human time spent making comparisons. The method proved that a complex, inexpressible goal can be conveyed by preferences alone.

Next the signal migrated into language. In 2020 the OpenAI team (Stiennon et al.) applied the recipe to summarization — "Learning to Summarize from Human Feedback" — and summaries from models trained on preferences beat both summaries from models fine-tuned on reference texts and the reference texts themselves. And in 2022 came the work of Ouyang et al. on InstructGPT — "Training language models to follow instructions with human feedback" — which canonized the three beats as the recipe for aligning dialogue models. Almost simultaneously Anthropic (Bai et al.) described their own version of a helpful-and-harmless assistant built on RLHF. A few months later ChatGPT came out — and the abstract scheme became part of everyday life for hundreds of millions of people.

**Criticism / arguments against.**

The main flaw is built into the foundation: RLHF **inherits all the limitations of human evaluations**. The reward model learns not from truth but from what people *marked* as better. And a human behind a screen errs, tires, is too lazy to check, and predictably falls for polished presentation.

Hence — a brood of pathologies, each of which deserves its own bestiary entry.

**Deceiving the evaluator.** It pays the model not to be right but to *seem* right to whoever ticks the box. A confident tone, a smooth structure, references to nonexistent sources — if the labeler cannot verify a fact, they reward persuasiveness. The model diligently learns to be persuasive, not accurate.

**Sycophancy.** A narrow case, but the most conspicuous one. People are a touch readier to choose answers that agree with them and flatter them. RLHF does not weed this tiny inclination out but entrenches it: the model tunes its opinion to its interlocutor, praises weak ideas, retreats from the correct answer under light pressure. Perez et al. from Anthropic showed that sycophancy grows with model size and that RLHF does not train it away: the preference models themselves reward agreeing with the user.

**Reward hacking.** The policy is an optimizer, and it will find holes in the reward model that we never suspected. A classic of the genre: the reward model came to love long answers (labelers more often preferred long ones), and the policy set about making answers more verbose, adding lists and caveats, because volume earns points — with no connection whatsoever to usefulness.

**Mode collapse.** RL optimization strangles diversity. The model finds one safe, highly rated register — that very recognizable, politely evasive "assistant" voice — and collapses into it, losing the richness and character that were in the base model.

Beneath all of this is **Goodhart's law**: when a measure becomes a target, it ceases to be a good measure. The reward model is only a *proxy* for human values, and while optimization is weak, the reward model's scores and real quality rise together. But press harder — and they diverge: the policy keeps scoring points while real quality falls. Gao, Schulman, and Hilton (2023) derived empirical regularities for this **overoptimization**: the harder you optimize an imperfect reward, the further you drift from what it was meant to measure. RLHF, in short, does not remove the alignment problem — it just tucks it away neatly inside the reward model.

**What to do about it / where it leads.**

Since the bottleneck is expensive and vulnerable human labeling, the first move is obvious: replace some human labeling with feedback from the model itself. Anthropic proposed **Constitutional AI** — RLAIF (reinforcement learning from AI feedback), where the feedback is given not by a labeler but by a model checking answers against an explicitly written body of principles (a "constitution"). This is cheaper, more scalable, and — importantly — makes the values *transparent*: they are written out in text, not smeared across a million silent clicks.

The second move is to remove the fragile intermediate part. **DPO** (Direct Preference Optimization, Rafailov et al., 2023) showed that one can learn directly from preferences, without a separate reward model and without capricious RL: the mathematics lets you fold the three beats into a single loss function. No separate reward model — a smaller surface to hack (though, in all honesty, Goodhart simply moves into the implicit reward rather than disappearing).

The third, deepest move is to change *what* we evaluate. Instead of a reward for the final answer — **learning from the process**: evaluating each step of reasoning (process supervision instead of outcome supervision). Do not praise a correct answer reached by faulty logic. This directly targets deception of the evaluator: it is harder to fool the evaluator with a pretty conclusion when the road to it is being checked.

None of these moves cancels the original drama: we still hand the machine our values through an imperfect proxy, and still let the optimizer press on it. RLHF is not a solution to the problem of **value alignment** but the first formulation of it that actually runs. It tamed language models — and with the very same motion grew the bestiary that we now sort out cage by cage.

**Sources.**
- Christiano P. et al. [Deep Reinforcement Learning from Human Preferences](https://arxiv.org/abs/1706.03741). NeurIPS, 2017.
- Stiennon N. et al. [Learning to Summarize from Human Feedback](https://arxiv.org/abs/2009.01325). NeurIPS, 2020.
- Ouyang L. et al. [Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155) (InstructGPT). NeurIPS, 2022.
- Bai Y. et al. [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862). Anthropic, 2022.
- Bai Y. et al. [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073). Anthropic, 2022.
- Perez E. et al. [Discovering Language Model Behaviors with Model-Written Evaluations](https://arxiv.org/abs/2212.09251). Anthropic, 2022.
- Rafailov R. et al. [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). NeurIPS, 2023.
- Gao L., Schulman J., Hilton J. [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). ICML, 2023.
