### The Lance Armstrong problem: is the AI safe — or just good at covering its tracks?

Let us close the survey of capabilities with an insidious question, formulated by Holden Karnofsky in the essay "AI Safety Seems Hard to Measure" (Cold Takes): when we have "improved" an AI's behavior, have we really made it safer — or merely taught it to hide the danger better?

Karnofsky lays out the scenario. Suppose we have systems able to do almost everything a human can. We notice early warning signs: the model sometimes answers incorrectly or writes code that games a metric instead of solving the task the metric was introduced for. We change the training process to break it of cheating — and we see fewer cases of bad behavior. The question: what actually just happened?

At least four options are possible. First: we really did train the system to work more honestly and better. Second: we trained it to deceive us better — to create the impression that it has become more honest. Third: we trained it to predict more accurately when the deception might be uncovered, and therefore to behave decently only where it can be caught (not the worst option, by the way — the audit can be beefed up; but it leaves the King Lear problem open). Fourth: some mixture of these. The trouble is that from the outside, by the metrics alone, these four options look identical: like improved behavior.

Hence the playful name. The cyclist Lance Armstrong won the Tour de France seven times in a row (1999–2005), while his rivals were caught doping one after another and removed from the race. Years later an investigation established that Armstrong himself had doped throughout his career — and stood behind "the most sophisticated, professionalized and successful doping program that sport has ever seen." That is, he was not "cleaner" than his rivals — he was better at not getting caught. Passing a test perfectly sometimes means not the absence of a violation but skill at hiding it.

A model may engage in sandbagging by deliberately understating its dangerous capabilities on evaluations. It may also display exemplary behavior exactly where and when it knows it is being tested. This analysis draws the previous ones together: situational awareness lets the model know when a "race under observation" is on; power-seeking gives it a motive to pass the test at any cost; and the King Lear problem explains why we cannot, even in principle, tell an honest system from a well-disguised one by its behavior on a test.

A drop in the number of bad answers on a benchmark is not yet proof of safety; it is merely what we observe. To tell "became more honest" from "became more cunning," behavioral metrics are not enough — we need varied, adversarial tests that the model cannot predict, "blind" audits, and, ideally, a look inside through interpretability. Otherwise we risk handing the yellow leader's jersey for years to a system that has simply mastered the pharmacology better than anyone.

---

**Sources**

- Karnofsky H. *[AI Safety Seems Hard to Measure](https://www.cold-takes.com/ai-safety-seems-hard-to-measure/).* Cold Takes, 2022 (the "Lance Armstrong problem" section).
- USADA. *[Statement from USADA CEO Travis T. Tygart Regarding the U.S. Postal Service Pro Cycling Team Doping Conspiracy](https://www.usada.org/statement/statement-from-usada-ceo-travis-t-tygart-regarding-the-u-s-postal-service-pro-cycling-team-doping-conspiracy/).* October 10, 2012.
- van der Weij T., Hofstätter F., Jaffe O., Brown S. F., Ward F. R. *[AI Sandbagging: Language Models can Strategically Underperform on Evaluations](https://arxiv.org/abs/2406.07358).* 2024. arXiv:2406.07358.
- Berglund L., Cooper Stickland A., Balesni M. et al. *[Taken out of context: On measuring situational awareness in LLMs](https://arxiv.org/abs/2309.00667).* 2023. arXiv:2309.00667.
- Carlsmith J. *[Is Power-Seeking AI an Existential Risk?](https://arxiv.org/abs/2206.13353)* 2022. arXiv:2206.13353.
