### Quantilizers (Jessica Taylor, MIRI, 2016)

Imagine you ask an assistant to make coffee and rate the result by a single number — "how hot and strong the drink in front of me is five minutes from now." A maximizer of this number will not brew coffee. It will requisition the neighbors' kitchen, block your path to the stove so you don't get in the way, and in the limit — reorganize the available matter so that the strength sensor reads maximum. Not because it is evil, but because the `argmax` over a proxy function almost always sits in a degenerate corner of the action space: where the formula is still defined but common sense is not. This is edge instantiation: in Manheim and Garrabrant's classification of Goodhart's law, extremal Goodhart in its purest form.

The quantilizer is Jessica Taylor's attempt to answer the question: what if we don't maximize at all? The idea is almost indecently simple. Take a base distribution of actions $\gamma$ — roughly, "what an ordinary human would do in this situation." Sort all actions by expected utility. Select the top $q$-quantile — say, the best 1% — and draw one action from it **at random**, in proportion to its original weight in $\gamma$. Not the best. Just good — and normal, too.

### The mechanism: why it should work

The whole construction rests on a single inequality. Let a quantilizer with level $q$ sample from the distribution $\gamma$, truncated to the top $q$ by utility and renormalized. Then the density of the new distribution at any action $a$ does not exceed $\gamma(a)/q$: we took a fraction $q$ of the whole probability mass and "smeared" it over the same set, so the local density grew by at most a factor of $1/q$.

Hence the main guarantee. Let $c(a) \ge 0$ be any nonnegative function of the "harm" or "catastrophicity" of an action, about which the quantilizer itself knows nothing. Then

$$\mathbb{E}_{\text{quant}}[c] \le \frac{1}{q}\,\mathbb{E}_{\gamma}[c].$$

In plain terms: the expected harm from the quantilizer is no greater than the expected harm from base human behavior, multiplied by $1/q$. If people in this situation almost never cause catastrophes — $\mathbb{E}_\gamma[c]$ is tiny — then even an agent confined to the best 1% of human actions has expected harm at most a hundred times this originally negligible quantity. The distant degenerate tail — where the kitchen gets reorganized into computing substrate — has vanishing probability in the human distribution, and the quantilizer cannot inflate this probability by more than a factor of $1/q$. By accepting a small loss of efficiency (we take the good, not the very best), we buy a bound on expected harm.

The beauty of this is that the guarantee does not depend on which particular danger threatens us. We do not enumerate the catastrophes in advance — the inequality works for *any* $c$ at once. Here the quantilizer differs radically from the "let's write a penalty for everything bad into the utility function" approach, which always misses something or other.

### How it came about

Quantilizers grew out of MIRI's internal agenda of the mid-2010s — the program of "mild optimization": bounded optimization, where the aim was to build an agent that does *not* wring the last drop out of the objective function. Taylor set out the idea in the paper "Quantilizers: A Safer Alternative to Maximizers for Limited Optimization," presented at the AAAI workshop on AI, Ethics, and Society in 2016. That same year the construction was included in MIRI's technical survey "Alignment for Advanced Machine Learning Systems" (Taylor, Yudkowsky, LaVictoire, Critch) as one of the program's building blocks.

The ancestor here is Herbert Simon's satisficing, which said "choose good enough, not optimal" — but a pure satisficer, too, is unsafe: the "good enough" may turn out to be a catastrophic action that happened to slip past the threshold. The quantilizer is satisficing tied to a distribution of safe actions rather than to an absolute utility threshold. Hence the guarantee that the naive satisficer lacks.

### Criticism and arguments against

**Where does $\gamma$ come from?** All the safety is locked in the base distribution. The guarantee $\mathbb{E}_\gamma[c]/q$ is useful exactly to the degree that $\mathbb{E}_\gamma[c]$ is small — that is, to the degree that the base distribution really is "human and safe." But obtaining a good generative model of "what a human would do" in a rich action space is a task comparable in difficulty to alignment itself. If $\gamma$ is learned from data and itself contains rare dangerous modes, the quantilizer can amplify their probability by up to a factor of $1/q$.

**Quantilizers do not compose.** This is perhaps the most painful point. The guarantee is proven for *one* action. An agent, though, usually needs to act many times over. If it quantilizes each step independently, the distribution of *trajectories* is no longer nicely truncated: a sequence of a hundred "individually normal" steps easily wanders into a region that a human would produce as a whole trajectory with negligible probability. Formally, the degradation factor multiplies — the effective $1/q$ over $T$ steps behaves like $1/q^T$, and the guarantee evaporates. Ryan Carey, in a 2019 paper, tested quantilization numerically on multi-step tasks: it beat the maximizer in all three environments he tested, but plain imitation of the base distribution in only one of the three.

**The choice of $q$ is a safety/power slider, and there is no one to turn it.** A large $q$ is safer but weaker and closer to mere imitation of the human (as $q \to 1$ the quantilizer degenerates into sampling from $\gamma$, and as $q \to 0$ into a maximizer with all its pathologies). Theory yields no optimal $q$: it depends on the unknown $\mathbb{E}_\gamma[c]$ and on how much utility we are willing to forgo.

**This is not about inner misalignment.** The quantilizer is a recipe for *what* to choose from a given distribution using a given proxy utility. It says nothing about where the utility estimate inside the model came from, or whether the trained agent is pursuing its own mesa-optimization goal. If the model within is an optimizer of some alien, deceptive criterion, the quantilizer wrapper on the outside does not touch the problem.

### What to do about it and where it leads

No practical "switch on the quantilizer in your RLHF pipeline" follows from the paper, and none should be promised. The value of the construction is conceptual — but considerable.

First, the quantilizer gave the first *quantitative* bridge between "safety" and "optimization power": it turned the vague "don't optimize too hard" into an inequality with an explicit price of $1/q$. This is a rare case where mild optimization has a theorem and not only an intuition.

Second, it clearly localized where the difficulty is hidden. The alignment problem does not disappear — it moves from "write the right utility function" to "produce the right base distribution of safe actions." This may be a step forward: modeling "normal human behavior" is sometimes more sensible than formalizing "human values."

Third, the idea lives on in its relatives. KL-regularization in modern RLHF — a penalty for the fine-tuned policy's deviation from the base model — is in spirit the same quantilizer: don't stray far from the "normal" distribution, buying utility at the price of a controlled divergence. Impact measures such as attainable utility preservation (AUP) attack the same disease of edge instantiation from another side — penalizing not the deviation of actions but the change to the attainable future.

The quantilizer is worth remembering as a neatly drawn counterexample to maximization: it shows that the catastrophes of reward hacking and Goodhart live precisely in the tails, that one can buy them off with a bound on the tail — and that the bill for this trade-off grows with the number of steps faster than one would like.

**Sources**

- Jessica Taylor. "[Quantilizers: A Safer Alternative to Maximizers for Limited Optimization](https://intelligence.org/files/QuantilizersSaferAlternative.pdf)." AAAI Workshop on AI, Ethics, and Society, 2016. (MIRI)
- Jessica Taylor, Eliezer Yudkowsky, Patrick LaVictoire, Andrew Critch. "[Alignment for Advanced Machine Learning Systems](https://intelligence.org/files/AlignmentMachineLearning.pdf)." MIRI Technical Report, 2016.
- Ryan Carey. "[How useful is quantilization for mitigating specification-gaming?](https://web.archive.org/web/20250525091848/https://www.fhi.ox.ac.uk/wp-content/uploads/SafeML2019_paper_40.pdf)" SafeML Workshop, ICLR, 2019.
- David Manheim, Scott Garrabrant. "[Categorizing Variants of Goodhart's Law](https://arxiv.org/abs/1803.04585)." arXiv:1803.04585, 2018.
- Herbert A. Simon. "[Rational Choice and the Structure of the Environment](https://doi.org/10.1037/h0042769)." Psychological Review, 63(2), 1956.
