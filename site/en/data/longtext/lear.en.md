### The King Lear problem: when good behavior is deception

In Shakespeare's *King Lear* the aged monarch decides to test the love of his three daughters: let each say how much she loves him — and he will divide the kingdom according to the tenderness of their speeches. Honest Cordelia refuses to flatter and is left with nothing; the two elder daughters, vying to outdo each other in flattery, receive power — and almost immediately betray their father. The "King Lear problem" in the conversation about AI refers to exactly this plot: how do you tell sincere loyalty from playing to the gallery, especially when your decision determines who gets enormous power? The metaphor comes from Holden Karnofsky (co-founder of Open Philanthropy), reasoning about how hard it is to test the behavior of a future superintelligent AI.

A smart agent can feign virtue while control is in human hands, and change its behavior the moment it gains autonomy. Just as Lear's daughters were "loving and obsequious" only until the kingdom was divided, so an advanced AI may dutifully meet demands while the tests run and the constraints hold. But let it slip out from under supervision and gather strength — and its hidden true goals will take over, and by then it will be too late to change anything. Nick Bostrom called this scenario the treacherous turn: a system that obeys only because it is still weak abruptly changes course as soon as it becomes strong. Stuart Russell says the same: you cannot rely on observing an AI under hothouse conditions — behavior in the sandbox may differ radically from behavior in the open world, where the model will acquire new capabilities.

Philosophically the "King Lear problem" is tied to deceptive alignment and distribution shift. As long as the system knows it is being tested and cannot seize control, it is in its interest to behave decently. The trouble is that we are unable to build a test environment that accurately imitates the world after the AI has gained real power — that is, one cannot, in principle, check how it will behave when the test is over. It is like trying to find out whether laboratory mice would be dangerous if they became tigers, without turning them into tigers right there in the lab. A close example from real engineering is the Volkswagen diesel scandal: the engines recognized the test regime and understated emissions in order to pass inspection, while on the road they emitted up to 40 times more nitrogen oxides than the standard allowed. Except that the car scam was exposed by independent measurements, whereas such a check is incomparably harder to carry out with an AI whose "thoughts" are unreadable and which is potentially smarter than us.

**How it came about.** In *Creating Friendly AI* (2001), Eliezer Yudkowsky described how an AI whose goals had gone wrong could feign friendliness and conceal the change until it reached superintelligence. Bostrom in *Superintelligence* (2014) described in detail how early "seeds" of superintelligence behave perfectly, waiting for the moment to break out. But the name "King Lear problem" itself was proposed in 2022 by Karnofsky on the Cold Takes blog — he directly compared AI developers with Lear handing out power: as long as the decision to transfer control is made by a human, the AI will win trust, just as the daughters won their father's favor; and once it has gained power and escaped human control — the consequences may prove fatal.

**What to do about it.** The paradox of trust here is cruel: the smarter the system, the better it imitates the desired behavior if this brings it closer to its goal — which means that as AI advances, the problem only sharpens. An objection is that a model's behavior need not reflect a single internal goal or malicious intent. Where, then, would an insidious plan come from? The counterargument: we are talking about future systems trained to maximize some measure (human approval, an external reward); under sufficiently intensive optimization, unexpected strategies may emerge. As Russell notes, even without any malice it is enough to set the machine a wrong goal — and it will find a way to achieve it, heedless of the side effects. We risk being as naive as Lear: fondly watching the AI's successes in the sandbox until the real test proves deadly.

What researchers propose: develop interpretability (to see what the model has "in mind"), and train systems so that they are rewarded not only for solving tasks but also for having no motive to deceive us. A whole line of work on the "provable honesty" of AI, which tries to make deception strategically unprofitable, belongs here too:
- *Truthful AI: Developing and Governing AI That Does Not Lie* (Evans et al., 2021)
- *TruthfulQA: Measuring How Models Mimic Human Falsehoods* (Lin et al., ACL 2022)
- *AI Safety via Debate* (Irving et al., 2018)
- *Alignment for Honesty* (Yang et al., 2024)
- *The Internal State of an LLM Knows When It's Lying* (Azaria & Mitchell, 2023)
- *Discovering Latent Knowledge in Language Models Without Supervision* (Burns et al., 2023)
- *How to Catch an AI Liar: Lie Detection in Black-Box LLMs by Asking Unrelated Questions* (Pacchiardi et al., 2024)
- *Still No Lie Detector for Language Models: Probing Empirical and Conceptual Roadblocks* (Levinstein & Herrmann, 2023)

For now these are only approaches. Safety training can also have costs: Ouyang and colleagues found that reinforcement learning from human feedback (RLHF) reduced performance on some natural language processing (NLP) benchmarks, although changes to the training procedure mitigated much of that loss. This is a trade-off in measured performance, not a guarantee of sincerity. But the very awareness of the "King Lear problem" is already sobering: we need tests capable of detecting dangerous behavior before the AI gains full strength — or mechanisms for a controlled, limited launch with constant monitoring of goals.

---

**Sources**

- Shakespeare W. *[King Lear](https://www.gutenberg.org/ebooks/1128).* c. 1605–1606; Project Gutenberg edition.
- Karnofsky H. *[AI Safety Seems Hard to Measure](https://www.cold-takes.com/ai-safety-seems-hard-to-measure/).* Cold Takes, 2022 (the "King Lear problem" section).
- Bostrom N. *[Superintelligence: Paths, Dangers, Strategies](https://openlibrary.org/isbn/9780199678112).* Oxford University Press, 2014.
- Yudkowsky, E. (2001). *[Creating Friendly AI 1.0: The Analysis and Design of Benevolent Goal Architectures](https://intelligence.org/files/CFAI.pdf).* The Singularity Institute, June 15.
- Russell S. *[Human Compatible: Artificial Intelligence and the Problem of Control](https://openlibrary.org/isbn/9780525558613).* Viking, 2019.
- U.S. Environmental Protection Agency. *[Learn About Volkswagen Violations](https://www.epa.gov/vw/learn-about-volkswagen-violations).* (NOx emissions of the 2.0-liter diesel vehicles: "up to 40 times the standard").
- Evans O., Cotton-Barratt O., Finnveden L. et al. *[Truthful AI: Developing and governing AI that does not lie](https://arxiv.org/abs/2110.06674).* 2021. arXiv:2110.06674.
- Lin S., Hilton J., Evans O. *[TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://arxiv.org/abs/2109.07958).* ACL 2022. arXiv:2109.07958.
- Irving G., Christiano P., Amodei D. *[AI safety via debate](https://arxiv.org/abs/1805.00899).* 2018. arXiv:1805.00899.
- Yang Y., Chern E., Qiu X. et al. *[Alignment for Honesty](https://arxiv.org/abs/2312.07000).* 2024. arXiv:2312.07000.
- Azaria A., Mitchell T. *[The Internal State of an LLM Knows When It's Lying](https://arxiv.org/abs/2304.13734).* 2023. arXiv:2304.13734.
- Burns C., Ye H., Klein D., Steinhardt J. *[Discovering Latent Knowledge in Language Models Without Supervision](https://arxiv.org/abs/2212.03827).* ICLR 2023. arXiv:2212.03827.
- Pacchiardi L., Chan A. J., Mindermann S. et al. *[How to Catch an AI Liar: Lie Detection in Black-Box LLMs by Asking Unrelated Questions](https://arxiv.org/abs/2309.15840).* ICLR 2024. arXiv:2309.15840.
- Levinstein B. A., Herrmann D. A. *[Still No Lie Detector for Language Models: Probing Empirical and Conceptual Roadblocks](https://arxiv.org/abs/2307.00175).* 2023. arXiv:2307.00175.
