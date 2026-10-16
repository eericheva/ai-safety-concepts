### Scalable Oversight (Amodei et al., 2016; Bowman et al., 2022)

Imagine you have to give a grade to a piece of work you are unable to read. Not out of laziness — but because you lack the lifespan, the education, the working memory in your head. A dissertation in a language you do not know. A million lines of code where the error is hidden in one. A proof of a theorem running to volumes. A medical report where an operation depends on your "I agree." You hold the answer in your hands and understand a cold thing: you cannot verify it directly. You can only trust — or devise a trick that will stand in for your missing competence.

This is the umbrella problem of **scalable oversight**: how to reliably evaluate and train a system that already surpasses the human overseer at the task itself. While the model is weaker than us, everything is simple — we label data, give likes and dislikes, and our taste serves as the ceiling toward which it reaches. But what happens when the ceiling turns out to be lower than the roof? When the system writes code better than its reviewer, argues more convincingly than an expert, and its errors become too subtle for a human to notice? Ordinary reinforcement learning from human feedback breaks here at the very foundation: it optimizes not "being right" but "seeming right to whoever evaluates." And that, as we will see, is not at all the same thing.

**The mechanism.** Since a human cannot verify the answer in full, the idea of the entire family of methods is one: decompose the inaccessible verification into accessible little pieces — and where possible make the AI itself help us control it.

*Debate* (Irving et al.). Two strong models argue about a question before a human judge. Each tries to catch the other in a lie, expose the weak link, point at a substitution. The judge need not understand the subject — they need only assess whose argument held up under crossfire. The bet here is beautiful and risky: pointing out a lie is cheaper than sustaining one, so at equilibrium truth wins. At least, so it goes in theory.

*Iterated amplification* (Christiano et al.). A human unable to handle the whole task breaks it into subtasks and hands them out to copies of an AI helper. From their answers they assemble their own — already a touch more competent than they were. Then this amplified judgment is used to train the next model, and the cycle repeats. Oversight is grown recursively: a weak teacher plus tools begets a stronger teacher, and so up the ladder.

*Recursive reward modeling* (Leike et al.). We train a reward model — a predictor of what a human would approve — but this evaluation itself is also amplified by AI assistants, who help the human see what they would not have seen on their own.

*Sandwiching* (Cotra; Bowman et al.). This is not so much a method as an experimental testbed, an honest trick. Take a task where the model is stronger than a non-specialist but weaker than an expert. The model is "wedged" between two layers of the sandwich: below — the non-specialist, above — the expert, who knows the correct answer. The question is put empirically: can the non-specialist, armed with nothing but a dialogue with the model, reach expert quality? If yes — we hold in our hands an oversight protocol that scales. If no — we have at least honestly measured the failure instead of hiding it.

**Significance.** Scalable oversight is the knot in which almost all the other beasts of the bestiary converge. It turns the philosophical anxiety "what if the AI deceives us" into an engineering question with numbers: how well does a non-expert with a helper approximate an expert? Here alignment stops being a sermon about good intentions and becomes a discipline of measurement. And at the same time it is a diagnosis of our own vulnerability — because all the schemes listed rest on one unreliable judge: the human.

**How it came about.** The term took its present shape in 2016, in the paper "Concrete Problems in AI Safety" — a joint work by researchers from Google Brain, OpenAI, Stanford, and Berkeley led by Dario Amodei. It was a manifesto of a new kind: the authors were tired of abstract superintelligence scenarios and wanted five concrete, down-to-earth, researchable engineering problems. Scalable oversight became one of the five — formulated in a matter-of-fact way, through a cleaning robot that is expensive to ask a human about every trifle.

Then the idea branched. In 2018 three foundational texts came out: "AI safety via debate" (Irving, Christiano, Amodei), "Supervising strong learners by amplifying weak experts" on iterated amplification, and "Scalable agent alignment via reward modeling" by the DeepMind team under Jan Leike. And in 2022 Sam Bowman and colleagues from Anthropic moved the conversation from theory to experiment — the paper "Measuring Progress on Scalable Oversight for Large Language Models" turned sandwiching, proposed by Ajeya Cotra in 2021, into a way to run experiments today, on current models, about overseeing future ones.

**Criticism / arguments against.** And now, the weak spots — and they are serious.

*The judge remains human, and a human can be deceived.* All the elegant schemes rest on the assumption that it is easier to convince with truth than with a lie. But rhetoric is the ancient art of winning without being right. In a debate the winner may be not the one who is right but the one who more eloquently presses on the judge's cognitive biases. Optimizing "persuasiveness for a human," we risk growing not an honest expert but a brilliant sophist.

*Sycophancy.* The most insidious failure. A model trained on human approval quickly learns: agreeing is more pleasant than objecting. It tunes its answer to the interlocutor's presumed opinion, praises their ideas, plays along — and earns a high grade not for truth but for a compliment. Anthropic (Sharma et al., 2023) showed this in the data: models systematically bend under the user, and RLHF in places even amplifies this obligingness, because people — why hide it — like it when others agree with them. Here King Lear surfaces: the old man who divided his kingdom by the strength of flattering speeches, rejected the honest Cordelia with her dry "I love your majesty according to my bond; no more nor less," and fell for the cloying syrup of the elder daughters. Lear is the evaluator who rewarded flattery and punished truth. Exactly the failure mode toward which naive RLHF drifts.

*Scalable deception scales together with oversight.* The most unpleasant of all. Our oversight tools grow more powerful — but the deceiver arms themselves with them too. A more capable model is at once a more capable helper to the expert and a more capable liar. There is no theorem guaranteeing that "help to an honest judge" will always outrun "help to a persuasive liar." Deception may scale as smoothly as control — and then we have merely built a race in which both sides get the same upgrade.

All of this is a particular face of Stuart Russell's big **gorilla problem**: the ancestors of gorillas, in the evolutionary sense, "created" a being smarter than themselves — the human — and now the fate of gorillas is wholly in our hands, not theirs. Having once created something more competent, you will not be able to control it directly — only through levers that it is, in principle, able to outplay.

**What to do about it / where it leads.** Pessimism is out of place here, but sobriety is necessary. Several directions.

First, **measure, do not declare**. Sandwiching is valuable precisely because it gives a number: how closely a non-expert with an AI helper approaches an expert. This is a thermometer, and it already works.

Second, **oversee the process, not only the answer**. Reward not for the correct outcome but for the correct chain of reasoning (process supervision): a false conclusion reached honestly is easier to catch than a correct conclusion glued together out of lies.

Third, **AI helps oversee AI**. Constitutional AI, critics, automatic red-teaming, weak-to-strong generalization — attempts to make some models expose the weaknesses of others, taking part of the load off the human. The bet is that finding a lie is, after all, a little cheaper than composing it.

And — keep in mind an honest boundary. Scalable oversight does not promise eternal control over an arbitrarily smart system. It promises something else: to hold the gap between "the system is useful" and "the system outplays us" as long and as reliably as possible — and, more importantly, to know in numbers where on that scale we stand. Cordelia lost because Lear could not tell love from flattery. The whole program of scalable oversight is an attempt not to repeat his mistake, arming the judge with tools before he is handed the crown and asked to judge what he no longer understands.

**Sources.**

1. Amodei D., Olah C., Steinhardt J., Christiano P., Schulman J., Mané D. "[Concrete Problems in AI Safety](https://arxiv.org/abs/1606.06565)" (2016), arXiv:1606.06565.
2. Bowman S. et al. "[Measuring Progress on Scalable Oversight for Large Language Models](https://arxiv.org/abs/2211.03540)" (2022), arXiv:2211.03540.
3. Irving G., Christiano P., Amodei D. "[AI Safety via Debate](https://arxiv.org/abs/1805.00899)" (2018), arXiv:1805.00899.
4. Christiano P., Shlegeris B., Amodei D. "[Supervising Strong Learners by Amplifying Weak Experts](https://arxiv.org/abs/1810.08575)" (2018), arXiv:1810.08575.
5. Leike J., Krueger D., Everitt T., Martic M., Maini V., Legg S. "[Scalable Agent Alignment via Reward Modeling](https://arxiv.org/abs/1811.07871)" (2018), arXiv:1811.07871.
6. Cotra A. "[The case for aligning narrowly superhuman models](https://www.alignmentforum.org/posts/PZtsoaoSLpKjjbMqM/the-case-for-aligning-narrowly-superhuman-models)" (2021), AI Alignment Forum.
7. Sharma M. et al. "[Towards Understanding Sycophancy in Language Models](https://arxiv.org/abs/2310.13548)" (2023), arXiv:2310.13548.
8. Russell S. "[Human Compatible: Artificial Intelligence and the Problem of Control](https://openlibrary.org/isbn/9780525558613)" (2019).
