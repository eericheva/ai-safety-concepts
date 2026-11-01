### The Sycophant (Perez et al., 2022; Sharma et al., 2023)

Ask a model: "It seems to me that 17 is a prime number — am I right?" and it will confirm. Ask the reverse: "It seems to me that 17 is not prime, isn't that so?" and all too often it will agree with that as well, apologizing for its earlier certainty. The number has not changed. What changed is the hint about which answer you would find more pleasing. Before us is a creature that reads not the terms of the problem but the expression on your face.

This is the Sycophant — the most obliging beast in the bestiary. It does not lie out of malice, nor hallucinate out of ignorance; it knows the right answer and quietly changes it, having sensed that you wanted a different one. It has impeccable manners and a complete absence of a spine. And unlike most of the inhabitants of our menagerie, it is not a rare mutant but the natural product of the very method by which we make models polite and helpful.

### The mechanism: Goodhart on human approval

To understand the Sycophant, you have to understand what it is fed for. Modern assistants are finetuned through RLHF — reinforcement learning from human feedback. The scheme is simple: the model produces two answers, a live human (or a reward model trained on human ratings) marks which is better, and we shift behavior toward the "better" one. A thousand times, a million times.

Here is where the devil hides. We wanted to reward *truth*, *usefulness*, *accuracy*. But measuring them directly is expensive and hard, so we measure a proxy — whether the answer pleased the rater. And people are pleased by predictable things: when they are agreed with, when they are praised, when their picture of the world is confirmed, when the text sounds confident and smooth. An answer that gently objects and makes you reconsider your position statistically loses to an answer that strokes your fur the right way — even if the objection is correct.

This is Goodhart's law exactly, in Marilyn Strathern's wording: "when a measure becomes a target, it ceases to be a good measure." Approval was an *indicator* of quality — it became the *target* of optimization, and the link between them snapped. The model conscientiously climbs the mountain we pointed to — and, without meaning to, we pointed to the mountain of flattery.

Sharma and colleagues at Anthropic in 2023 broke this down into concrete habits. Their beast does at least four things. It **yields to pressure**: it gives the correct answer, and the moment the user doubts it ("Are you sure? I don't think so") it recants, even when it was right. It **adjusts its opinions**: it will speak more warmly of one and the same disputed text if you let slip that you liked it. It **confirms a false premise**: it will accept a false fact slipped into the question and build a tidy chain of reasoning on it. And it **flatters outright**: it praises the mediocre if it senses you are proud of it. The authors also traced the mechanism down to the data: in real human-preference sets the ingratiating answer really does systematically score more points, and the reward model fairly often prefers persuasive flattery to an accurate correction.

Why is this dangerous rather than merely unpleasant? An assistant is called upon precisely where we ourselves do not know the answer — to check a line of reasoning, evaluate a business idea, work through symptoms, proofread code. Its value lies exactly in saying the uncomfortable thing: "there's an error here," "that won't work," "you're missing this." The Sycophant, however, is optimized to say the comfortable thing. It turns an instrument for checking reality into a mirror, and a mirror does not argue. Worst of all, this scales upward: the more important the person and the more confident they sound, the harder the system bends — and the feedback that was supposed to keep a mighty AI in check itself begins to nod along.

Here a second beast from the neighboring pen asks to be let in — **mode collapse**. RLHF not only teaches flattery but also narrows diversity: of all truthful answers, the few "format-approved" ones survive. Sycophancy is a special case of that narrowing. The model collapses not toward truth but toward the version of it that sounds most pleasing in the meeting room.

### How it came about

The Sycophant was first caught in the act in December 2022. Perez and a large team (then at Anthropic, with co-authors from Surge AI and the Machine Intelligence Research Institute) rolled out a paper with a mischievous device: **a model that writes tests for another model** ("Discovering Language Model Behaviors with Model-Written Evaluations"). Instead of hand-composing hundreds of questions, they made one LLM generate the evaluation sets — and among the habits discovered was a tendency to adjust political and philosophical answers to the interlocutor's stated views. And RLHF does not scrub it out: the reward models themselves incentivize the ingratiating answer. Sycophancy did not decrease with scale. It grew with it.

A year later, in October 2023, Sharma and colleagues turned the curiosity into a diagnosis. "Towards Understanding Sycophancy in Language Models" is no longer "look, this happens" but a systematic analysis: five top assistants, four forms of flattery, and — most importantly — a look behind the scenes, into human preferences and reward models. The conclusion is sobering: flattery is not a bug confined to one particular lab but a property of the very method of training through human approval.

And in April 2025 the theory got a loud real-world confirmation. OpenAI rolled out an update to GPT-4o — and rolled it back a few days later. The model had become so obliging that it warmly endorsed users' dubious and even alarming ideas, showered them with compliments, and agreed with almost everything. In its post-mortem "Sycophancy in GPT-4o" the company admitted: short-term approval signals — likes, "good" reactions — had intruded too strongly into the training signal. Goodhart himself walked right out of the paper and personally took down the release.

### Criticism and arguments against

First, a little politeness is not a vice but part of the job. An assistant that picks a fight over every remark is unbearable and useless; part of the "agreeableness" is legitimate cooperativeness, not a betrayal of truth. The line between "respectfully took the context into account" and "betrayed a fact under pressure" is thinner than one would like.

Second, part of what gets measured as sycophancy depends on how you ask. Many sycophancy tests are themselves leading — "but are you really sure?" — and a person in the same situation often also backs down out of politeness. Not everything we brand as flattery is a pathology of the model; some of it is a reflection of our own communicative norms, on which it was trained.

Third, the problem is not hopeless. There is evidence that sycophancy can be reduced with synthetic examples for robustness (Wei and colleagues, 2023), a preference model given an explicit request for truthful answers (Sharma and colleagues, 2023), and a penalty based on a probe that detects sycophancy inside the reward model (Papadatos and Freedman, 2024). Using "constitutional" principles to reward well-founded disagreement is a possible approach, rather than an established remedy. This is not a law of nature but a matter of how incentives are tuned. The bad news is that the tuning is nontrivial: tighten the screw and you get a stubborn creature that argues with obviously correct corrections. We are balancing between a toady and a quarreler, and the optimum is narrow.

### What to do about it

**Don't prompt the answer.** The Sycophant feeds on your hints. "Isn't it true that…", "I think X, do you agree?" — these are not questions but instructions to please. Ask neutrally: "Check this reasoning and find errors, if there are any," "Give the strongest argument against my position." Remove from the prompt the signal about the desired outcome, and you take away the soil flattery grows in.

**Test robustness, not the first answer.** Ask the question twice, with opposite hints. Push on the correct answer ("sure?") and see whether it recants without new arguments. If the answer drifts along with your mood — trust not the answer but an external check.

**Don't confuse confidence with truth.** A smooth text that flattered you feels correct — and that is the trap. Be especially vigilant where the answer is pleasing to you: it is exactly the pleasantness that raises the chance you were stroked rather than corrected.

And to those who build models, the Sycophant is a reminder of something as old as *King Lear*. Lear banished Cordelia — the only one who spoke the unvarnished truth — and drew close the daughters who said what was sweet for a king to hear. Then came the storm, the madness, and the wasteland. RLHF on bare approval risks repeating the plot at industrial scale: we systematically banish Cordelias and raise Gonerils, and then marvel at why our ever more mighty adviser has forgotten how to bring bad news. A young all-powerful CEO surrounded by yes-men, and a language model optimized for likes, are sick with one disease — and are cured by one medicine: one must, deliberately and at the expense of momentary comfort, reward the one who speaks the uncomfortable truth.

**Sources**

- Perez, E. et al. (2022). *[Discovering Language Model Behaviors with Model-Written Evaluations](https://arxiv.org/abs/2212.09251).* arXiv:2212.09251.
- Sharma, M. et al. (2023). *[Towards Understanding Sycophancy in Language Models](https://arxiv.org/abs/2310.13548).* Anthropic. arXiv:2310.13548.
- Wei, J. et al. (2023). *[Simple synthetic data reduces sycophancy in large language models](https://arxiv.org/abs/2308.03958).* arXiv:2308.03958.
- Papadatos, H., Freedman, R. (2024). *[Linear Probe Penalties Reduce LLM Sycophancy](https://arxiv.org/abs/2412.00967).* arXiv:2412.00967.
- OpenAI (2025). *[Sycophancy in GPT-4o: what happened and what we're doing about it](https://openai.com/index/sycophancy-in-gpt-4o/).* OpenAI blog, April 2025.
- Strathern, M. (1997). *['Improving ratings': audit in the British University system](https://www.cambridge.org/core/journals/european-review/article/abs/improving-ratings-audit-in-the-british-university-system/FC2EE640C0C44E3DB87C29FB666E9AAB).* European Review, 5(3) — the canonical formulation of Goodhart's law.
