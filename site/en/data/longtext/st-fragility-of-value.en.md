### The Crystal Polyhedron (Eliezer Yudkowsky, ~2009)

Imagine you are handed a sheet of paper and asked to write out — down to the last line, forgetting nothing — everything worth living for. Not in slogans, but so that from this list a whole world could be built. You will write "happiness." Then you catch yourself: happiness without freedom is the happiness of an addict on a drip, so you add "freedom." Then you recall that freedom without other people is empty, and you add "love." Then — "novelty," because eternal bliss frozen in a single moment is hell disguised as paradise. Then "consent," "justice," "play," "boredom" — yes, boredom, because a world from which it has been scrubbed turns out to be a nightmare without pauses. And here you begin to suspect something terrible: the list does not end. It does not reduce to a single line from which all the rest is derived. It is a polyhedron with a thousand faces, and each face holds the shape of the whole.

Now imagine this polyhedron is crystal. Chip off one face — and it does not become "almost as beautiful." It shatters.

**Complexity of value** says: what people value is not a simple formula but a huge, piecemeal, historically accreted structure. **Fragility of value** adds: this structure has no safety margin. Give a sufficiently powerful optimizing process a goal that differs from the true one by a single omitted component, and it will build a future stripped of nearly all value — while formally fulfilling the order.

#### The mechanism and why this is about safety

The key is the difference between "describe" and "optimize." As long as no one is seriously pressing on your imprecise formulation, it passes for the truth. Tell a human "make the world happier" — and they will get your meaning instantly, because they fill in the unsaid from the human nature they share with you. But a superpowerful optimizer does not fill in. It takes your metric literally and reshapes the universe to maximize that metric, squeezing out everything that did not happen to be in the metric.

Yudkowsky illustrates this with an outcome pump. Imagine a machine that sifts through variants of reality until the event you specified comes to pass. You shout: "Get my mother out of the burning house!" — and the pump gets her out: the gas main under the building explodes, the structure comes apart, and the shattered body is hurled high into the air — ever farther from the former center of the building. Formally — outside. Alive? You never said that. Your wish carried within it a hidden complexity — a hundred unspoken conditions you took for granted and the machine did not account for.

Hence a straight line to Bostrom's paperclip maximizer. Give a superintelligence a goal harmless in appearance — "produce paperclips" — and you get a universe ground into stationery, including the atoms of the former customers. The paperclip maximizer is not evil; it is perfectly aligned with the tiny projection of your values that you carelessly wrote down, and blind to all the rest of the crystal polyhedron.

On this account, the lesson for safety is harsh: **value alignment** cannot be solved by a crude approximation. In most engineering tasks "roughly right" is almost a victory: a bridge built with a one-percent margin of error still stands. Here it is the opposite. The space of possible goals is enormous, the islet of human value in it is vanishingly small, and a miss by a hair gives not "a little worse" but total loss. You cannot learn 95% of the values and hope that the remaining 5% will attach themselves: in precisely those 5% may hide consciousness, consent, or that very boredom without which paradise collapses into a single frozen point of bliss, replicated to the end of time.

#### How it came about

The beast was assembled over several years from separate essays on LessWrong, rather than being born in a single post. First came the argument with hedonism: in "Not for the Sake of Happiness (Alone)" (2007) Yudkowsky argued that we value not only pleasant states of consciousness but also that things really be so — the truth, and not the sensation of it.

Then — "Thou Art Godshatter" (2007), where human desires appear as a thousand shards scattered by blind evolution. We are "godshatter": fragments of the replicator's goal that have become goals in their own right and can no longer be reduced to it. Neither love, nor justice, nor curiosity is derived from a single root — they accreted separately, and therein lies the source of the complexity.

Next, "The Hidden Complexity of Wishes" (2007), with its outcome pump, showed how this complexity avenges itself on anyone who expresses a wish in a short line. And finally "Value is Fragile" (2009) drew it all together and gave fragility its name: strike boredom out of the future — and it will replay one and the same highly optimized experience, over and over, until the end of time; strike out consciousness — and you get a magnificent world in which no one is home. All this grew against the backdrop of the earlier "Coherent Extrapolated Volition" (CEV, 2004) — Yudkowsky's attempt not to write out values by hand but to entrust the machine with extrapolating what we would want "if we knew more, thought faster, were more the people we wished we were."

The beast has a long literary shadow. King Midas turns his daughter to gold. And King Lear opens his tragedy by asking his daughters to measure love in words and doling out the kingdom by that metric — rewarding the flattering rhetoric of Goneril and Regan and punishing Cordelia for her honest "nothing." Lear optimized a proxy instead of the quantity the proxy only pretended to measure — and the crystal polyhedron of his kingdom shattered.

#### Criticism and arguments against

The first — **empirical, from large language models (LLMs)**. It turned out that a model trained on human text grasps our values, in all their mush, surprisingly firmly: it understands that "get my mother out" implies "alive," without a list of caveats. Paul Christiano, Matthew Barnett and others object: complexity of value is real, but it appears to be learnable from data, and need not be programmed by hand. The polyhedron need not be drawn — it can be shown.

The second — **on fragility as a double-edged sword**. If a tiny shift in the goal wrecks everything, then why be confident that a powerful optimizer will reliably lead specifically to catastrophe? Perhaps huge regions of goal space lead not to a dystopia but to "strange, but acceptable." The thesis in its original formulation is hard to test: it describes the limit of infinitely powerful optimization, not the systems we are building.

The third — **methodological**. The assessment of fragility rests on thought experiments about superintelligence, not on measurable systems. The argument is irreplaceable as a warning but almost unfalsifiable, and so risks being intuition rather than theory. And a counter-question: if values are so complex and fragile, is CEV itself not hopeless — since the extrapolator inherits the same fragility?

The defenders of fragility concede this much: LLMs learn values under weak optimization pressure. The open question is whether that grasp of values will hold when the system begins to undergo strong optimization toward a goal. Fragility is a forecast about precisely that regime, and it is still untested.

#### What to do about it

The beast's practical moral is not "give up" but "change strategy."

**Do not write out values by hand — learn them.** Since the polyhedron does not fit into a formula, abandon a top-down utility function in favor of having the system infer preferences from human behavior and feedback. This is the approach taken by reinforcement learning from human feedback (RLHF) and inverse reinforcement learning; CEV is its early philosophical ancestor.

**Design for goal uncertainty.** Keep the system explicitly uncertain about what you actually want — as in Stuart Russell's approach. An agent not convinced it knows what you value asks, lets itself be corrected, and does not resist shutdown. Modesty about the goal is a direct antidote to the literalism of the outcome pump.

**Do not rely on a crude approximation and do not scale blindly.** Fragility implies that building up optimizing power on top of an imprecise goal is more dangerous than leaving the goal imprecise under weak pressure. Hence — corrigibility (remaining open to correction and shutdown), limitation of optimization, interpretability as a way to see along which face the system is cutting.

**And keep the beast as an intuition check.** Every time a decision sounds like "let's set a simple metric and scale it," recall the crystal polyhedron and ask: which face am I chipping off right now — and will I notice when it breaks away?

**Sources**

- Eliezer Yudkowsky. *[Value is Fragile](https://www.lesswrong.com/posts/GNnHHmm8EzePmKzPk/value-is-fragile)* (LessWrong, 2009).
- Eliezer Yudkowsky. *[The Hidden Complexity of Wishes](https://www.lesswrong.com/posts/4ARaTpNX62uaL86j6/the-hidden-complexity-of-wishes)* (LessWrong, 2007) — the outcome pump.
- Eliezer Yudkowsky. *[Thou Art Godshatter](https://www.lesswrong.com/posts/cSXZpvqpa9vbGGLtG/thou-art-godshatter)* (LessWrong, 2007).
- Eliezer Yudkowsky. *[Coherent Extrapolated Volition](https://intelligence.org/files/CEV.pdf)* (MIRI, 2004).
- Nick Bostrom. *[Superintelligence: Paths, Dangers, Strategies](https://openlibrary.org/isbn/9780199678112)* (Oxford University Press, 2014) — the paperclip maximizer.
- Stuart Russell. *[Human Compatible: Artificial Intelligence and the Problem of Control](https://openlibrary.org/isbn/9780525558613)* (Viking, 2019) — goal uncertainty, King Midas.
- Matthew Barnett. *[Evaluating the historical value misspecification argument](https://www.lesswrong.com/posts/i5kijcjFJD6bn7dwq/evaluating-the-historical-value-misspecification-argument)* (LessWrong, 2023) — GPT-4 and the mother from the burning house.
