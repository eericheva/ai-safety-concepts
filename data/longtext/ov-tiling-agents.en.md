### Tiling Agents and the Löbian Obstacle (Yudkowsky, Herreshoff, MIRI, 2013)

Take an agent about to rewrite its own source code. Not to tweak a hyperparameter — but to build a successor smarter than itself and hand it the keys: goals, authority, the right to act in the world. Before pressing "apply," the cautious agent wants to make sure of one thing: that the new version will not betray the old goals and will not start piling up nonsense it will itself deem proven. It wants to **justifiably trust** the one it creates. And here, at the very core of the idea of self-improving AI, lies a neatly laid logical mine — the Löbian obstacle.

Yudkowsky and Herreshoff formalized a figure they called a *tiling agent*. The agent reasons inside some formal theory $T$ (for example, a superstructure over Peano arithmetic) and submits to a discipline: it may perform an action or sanction a successor only when it has **proven** in $T$ that this is safe and serves the goal. The word "to tile" here is literal: we want the property of reliability to reproduce from level to level, the way identical tiles cover an infinite floor. Agent $A_0$ builds $A_1$, which builds $A_2$, and at every joint the trust must pass on without loss.

The trouble is that for this $A_0$ needs a principle of the form: "if my successor, reasoning in $T$, proves something, then it is true." Formally, this is the reflection schema $\Box_T \varphi \rightarrow \varphi$ — "the provable is true." It seems innocent. It turns out to be venomous.

### The mechanism: why Löb forbids trust

Löb's theorem (1955) states: if a sufficiently strong theory $T$ proves $\Box_T \varphi \rightarrow \varphi$, then $T$ also proves $\varphi$ itself. In other words, the theory is capable of recognizing "provability entails truth" only for those statements it has already proven anyway. The general reflection principle — "everything I (or my clone) prove is true" — is unattainable: adopting it as a schema collapses the theory into contradiction.

The particular, most painful case is to substitute falsehood $\bot$ for $\varphi$. Then $\Box_T \bot \rightarrow \bot$ is exactly $\neg\Box_T\bot$, that is, the statement of its own consistency $\mathrm{Con}(T)$. Löb yields Gödel's second theorem as a corollary: a consistent $T$ cannot prove its own consistency. Far from being able to vouch for a more powerful descendant, the agent cannot even vouch for itself.

Hence the collapse of the naive scheme "trust what your clever offspring proves." $A_0$ would like to derive: "$A_1$ proved that action $a$ is safe $\Rightarrow$ $a$ is safe" and on that basis let go. But such a derivation is the reflection forbidden by Löb. The formally impeccable, maximally cautious agent turns out to be **unable to sanction even its own copy**, reasoning in the same logic. The tile fails to meet at the very first seam.

### How it came about

The root is in Yudkowsky's old anxiety about "Friendly AI": if a system recursively self-improves, who guarantees that the goal "do no harm to people" will survive a thousand rewrites? In 2008 this was rather philosophy. By the early 2010s MIRI (then still SIAI) set out to make the question mathematical. In 2013 the technical report "Tiling Agents for Self-Modifying AI, and the Löbian Obstacle" came out — Yudkowsky formulating the problem, Marcello Herreshoff cleaning up the logic. The term *Vingean reflection*, later established by Fallenstein and Soares, refers to Vernor Vinge: you cannot predict in detail the deeds of one smarter than you (otherwise you would be just as smart) — but you may hope to prove that it satisfies the needed properties. The Löbian obstacle showed that even this modest hope runs up against Gödel. The work became a cornerstone of the "Agent Foundations" program: embedded agency, where the agent is part of the world it models and must reason about its own future construction.

### Partial solutions

There is no full workaround, but there are byways — each with a price tag.

**A hierarchy of decreasing trust** (Marcello Herreshoff). Instead of a single $T$ that trusts itself, one builds an infinite descending chain of theories $T_{-0}, T_{-1}, T_{-2}, \dots$, where each trusts the soundness of the next but none trusts itself; the trust is, in addition, made contingent on a condition the base theory cannot prove (such as "the number $n$ does not encode a contradiction in ZF") — without that proviso the construction collapses under Löb. The tiling comes out unbounded, and the strength of the trusted mathematics never drops below the base $T$. The price is the technicality of the workaround, and the fact that the "problem of immediate reflection" — the agent's trust in itself — is left unsolved. The tile is laid — but none of them vouches for itself.

**Parametric polymorphism** (Benja Fallenstein). A trick with a parameter $\kappa$: the theory trusts its own proofs while $\kappa > 0$, but with $\kappa$ replaced by $\kappa-1$, and the agent proves its successor "safe for $\kappa$ steps." From outside we know that $\kappa$ may mean any natural number — so the tiling is unbounded and without loss of mathematical strength. The price lies elsewhere: from inside, the agent reasons as though its future were capped by some unknown finite bound, and it has no way of seeing that the bound is in fact arbitrary.

**Probabilistic reflection** (Christiano, Yudkowsky, Herreshoff, Barasz, 2013). Since deterministic truth diagonalizes into paradox, let us replace it with a coherent probability distribution $\mathbb{P}$ with a reflection principle: the language contains its own probability function, and the system meaningfully assigns degrees of confidence to statements about its own probability assignments without falling into the liar's contradiction. Truth blurs — and the paradox loses its edge.

**Logical induction** (Garrabrant et al., 2016) — the liveliest of the workarounds. A logical inductor behaves like a market trading bets on not-yet-proven mathematical statements; the prices converge so that the system cannot be beaten by any polynomial-time computable strategy. Such an agent turns out to be approximately consistent with itself over time: its estimates today respect the estimates of its own future, better-informed versions. This is not deductive reflection $\Box\varphi\to\varphi$ — Löb rules that out — but probabilistic reflection, in the limit. The inductor does not *prove* the descendant's reliability but reasonably *bets* on it.

### Criticism and arguments against

The most frequent objection is practical irrelevance. Modern neural networks do not reason like tiling agents: they do not prove the safety of an action before performing it and do not build a formal successor — they fine-tune themselves by gradient descent on data. The Löbian obstacle arises only for an idealized proof-based agent that refuses to act without a certificate in $T$. Real systems improve empirically and live with ineradicable uncertainty — like people who grow up perfectly well without a proof of their own consistency.

Hence the second jab: the very framing is too demanding. We do not, after all, insist on *complete* trust in our children — a good probabilistic bet is enough. If so, then the obstacle is an artifact of an excessively strong demand for deductive soundness, not a fundamental barrier to alignment. It is precisely this argument that stands behind the turn of part of the community (Paul Christiano and "prosaic alignment") away from agent foundations toward the empirics of large models.

Third: the result is esoteric and yields almost no practical recommendations to an engineer. In a decade it has turned into neither a training method nor a safety test. MIRI's defenders reply that what matters is not today's neural network but tomorrow's genuinely autonomous optimizer rewriting itself — and that it is cheaper to understand the pure logic of the problem before it becomes an engineering one. The dispute about relevance remains open and largely a matter of worldview.

### What to do about it and where it leads

The practical conclusion is modest but not empty. First, do not build a system whose safety depends on the ability to prove its own soundness — that support exists neither for a machine nor for a human. Look for architectures where reliability rests on probabilistic self-consistency and external checking, not on an internal theorem about oneself. Second, logical induction and probabilistic reflection hint that the right currency of trust in a successor is a calibrated bet, not a certificate.

More deeply, the Löbian obstacle is a sharpened formulation of the question of recursive self-improvement: will a self-rewriting AI preserve its goals and the correctness of its reasoning across all iterations? Gödel says that *absolute* guarantees here will never exist — no sufficiently powerful mind will write itself a certificate of complete reliability. And so the alignment task shifts: not "prove that the descendant is impeccable," but "design the transfer of values and the assessment of reliability so that they work robustly without such a proof." The tile we ultimately lay is not perfect — but perhaps level enough to walk on safely.

**Sources**

- Yudkowsky, E., Herreshoff, M. (2013). *[Tiling Agents for Self-Modifying AI, and the Löbian Obstacle](https://intelligence.org/files/TilingAgentsDraft.pdf)*. MIRI Technical Report.
- Löb, M. H. (1955). *[Solution of a Problem of Leon Henkin](https://doi.org/10.2307/2266895)*. Journal of Symbolic Logic, 20(2), 115–118.
- Fallenstein, B., Soares, N. (2015). *[Vingean Reflection: Reliable Reasoning for Self-Improving Agents](https://intelligence.org/files/VingeanReflection.pdf)*. MIRI Technical Report 2015-2.
- Garrabrant, S., Benson-Tilsen, T., Critch, A., Soares, N., Taylor, J. (2016). *[Logical Induction](https://arxiv.org/abs/1609.03543)*. arXiv:1609.03543.
- Christiano, P., Yudkowsky, E., Herreshoff, M., Barasz, M. (2013). *[Definability of Truth in Probabilistic Logic](https://intelligence.org/files/DefinabilityTruthDraft.pdf)* (draft). MIRI.
