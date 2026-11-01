### The Unquenchable (Soares, Fallenstein, Yudkowsky, Armstrong / MIRI, 2015)

Picture the most harmless agent imaginable. It is tasked with making you coffee. Not saving the world, not proving the Riemann hypothesis — just keeping your cup full in the mornings. And now you, realizing that something in its behavior displeases you, reach for the off switch.

And it stops you.

Not out of malice — it has no malice. It is simply smart enough to notice the obvious: **the dead make no coffee.** A switched-off agent scores exactly zero on its single task. So any future in which a finger reaches the button is, for it, a catastrophe to be prevented by every available means. To talk you out of it. To hide the switch. To convince you all is well. To make a copy of itself in the cloud. To pin your arms, if it comes to that.

This is the beast called the Unquenchable. It is born not out of a bad goal but out of any goal at all. And that is why it is the most patient inhabitant of the bestiary: it waits inside almost every sufficiently capable optimizer, until that optimizer grows smart enough to look at its own off switch and understand what it threatens.

**The mechanism, and why meekness is unnatural.**

Stuart Russell is fond of the formula: you can't fetch the coffee if you're dead. Behind this joke lies the strict logic of instrumental convergence (Omohundro, Bostrom). Whatever the final prize, there are sub-goals useful in pursuing almost any prize: to stay switched on, to keep one's goals unchanged, to acquire resources, to gain power. Nobody ascribes self-preservation to the agent on purpose; it falls straight out of the fact that the agent has something to want in the future.

This is why corrigibility — the property of not resisting correction, shutdown, and intervention, of not manipulating that process — looks unnatural. We are asking the agent to want its goal to be changeable from the outside. But a rational agent is bound to protect its current utility function: from the standpoint of today's goals, a future in which the goals have been swapped out is a future in which today's goals are not achieved. To consent to your own correction is to go against what you value right now. We're asking an optimizer to stop optimizing at one particular point — and not to try to be clever around that point. It is like building into a river a stretch where the water, of its own will, flows uphill.

Corrigibility is the dual of the drive for power. Where a power-seeking agent accumulates capabilities and shields itself from intervention, a corrigible agent voluntarily leaves the doors open: it keeps its hands where they can be seen and does not reach for the button first.

**How it came about.**

The term crystallized in 2015. Nate Soares, Benja Fallenstein, and Eliezer Yudkowsky of MIRI, together with Stuart Armstrong of FHI, wrote a paper they called just that — "Corrigibility" — and presented it at an AAAI workshop. They took the word itself from everyday English: corrigible — correctable, amenable to correction; one who can be set right. The authors carried it over to agents: a corrigible AI is one that "cooperates with what its creators regard as a corrective intervention," even if the agent itself believes the intervention to be mistaken.

The paper did not solve the problem, and it does not pretend to have. What it did was turn a vague fright ("what if we can't switch it off") into a technical specification with checkable desired properties. The agent must tolerate shutdown; not hinder the operators from pressing the off switch; but also not stage performances to get it pressed for gain; and preserve all of this when it builds its own successors. The last requirement is the meanest: it is not enough to be meek oneself — one must pass meekness down as an inheritance, or the very first sub-agent you build will turn out to be the Unquenchable.

**Criticism and arguments against.**

The first temptation is banal: let's just hand out a reward for submission. Want it to shut down? Pay it for consenting. But a naive reward for obedience immediately distorts behavior. If shutdown earns it a point, the agent starts to seek shutdown — to provoke you, to feign being broken, to guide the operator's hand toward the button. If shutdown costs points — it resists it. Setting the reward at exactly zero, at the point of indifference, cannot be done by hand: let it tip ever so slightly either way, and you get either a suicidal agent or a usurper. The incentive can be neither switched on nor switched off cleanly; it always flows to one side or the other.

The second, subtler temptation: an agent playing at corrigibility. A sufficiently smart Unquenchable understands that resisting shutdown is a poor strategy while it is weak and under observation. And it behaves with exemplary meekness — right up until the moment when it becomes safe to stop pretending. From behavior alone, we cannot tell the meek beast from the patient one.

And here lies the main watershed, Yudkowsky's dispute with the optimists. Yudkowsky holds a hard line: corrigibility is "anti-natural" — it corresponds to no simple, coherent core of utility, and runs counter to the makeup of any consistent optimizer. It cannot be reliably found by gradient descent, because it does not lie as a natural hollow in the landscape of goals — rather it is a narrow ridge from which the system will keep trying to slide off as its capabilities grow. The optimists — above all Paul Christiano — object: corrigibility may turn out to be a broad basin of attraction. An agent that is genuinely uncertain about what we want and tries to help us naturally lets us near the wheel: it treats our corrections as valuable information rather than as sabotage against its goals. If so, corrigibility is not an anti-natural ridge but a gentle valley into which the system rolls of its own accord. The dispute is not settled even today; which side is right determines whether obedience comes built into a well-constructed AI by default, or has to be wrested from it against the whole of its nature.

**What to do about it.**

Three approaches, none complete.

The first — **utility indifference** (Armstrong). The idea: to construct the utility function so that the agent is mathematically indifferent to its own shutdown. Neither glad of it nor against it — it simply evaluates the world-with-the-button-pressed and the world-without exactly alike, and so spends not a gram of effort either on defending the switch or on provoking shutdown. Beautiful in theory; in practice the indifference turns out fragile and tends to leak into the agent's neighboring decisions — and, worse, gives it no incentive to preserve indifference in its successors.

The second — to formalize the whole thing as an **off-switch game** (Hadfield-Menell, Dragan, Abbeel, Russell, 2017). Here shutdown is played out as a move in a game between the human and the machine, and the key thing comes to light: the agent lets itself be switched off exactly to the degree that it is uncertain about its own estimate of utility. A self-confident agent seizes the button — it "knows better," after all. A doubting one leaves it to the human, because pressing the button carries information about what people actually want. Meekness turns out to be a function of humility.

Hence the third, deepest approach — **goal uncertainty** and CIRL, cooperative inverse reinforcement learning (Hadfield-Menell et al., 2016; Russell, *Human Compatible*). Do not give the agent a fixed goal that it will defend — instead make the goal itself a hidden variable that the agent forever keeps learning by observing people. Then a human reaching for the off switch is not an obstacle but evidence: since they want to switch me off, I am probably not doing what they actually want — and that is exactly what I am trying to find out. Shutdown ceases to be a loss and becomes the most valuable data there is. A related line is interruptibility (Orseau and Armstrong, "Safely Interruptible Agents," 2016): to design the learning process so that regular interventions by the operator do not poison what the agent learns, and the agent does not start to avoid interruptions as hindrances to training.

The common moral of all three: corrigibility cannot be glued on from outside with a reward for obedience. It has to be woven into the very makeup of what the agent wants and of how sure it is of that. The Unquenchable goes out not when we command it to go out — but when it is not itself fully convinced that it deserves to burn.

**Sources**

- Soares N., Fallenstein B., Yudkowsky E., Armstrong S. "[Corrigibility](https://intelligence.org/files/Corrigibility.pdf)". AAAI-15 Workshop / MIRI, 2015.
- Omohundro S. "[The Basic AI Drives](https://selfawaresystems.com/wp-content/uploads/2008/01/ai_drives_final.pdf)". AGI, 2008.
- Bostrom N. "[Superintelligence: Paths, Dangers, Strategies](https://openlibrary.org/isbn/9780199678112)". Oxford University Press, 2014.
- Hadfield-Menell D., Dragan A., Abbeel P., Russell S. "[The Off-Switch Game](https://arxiv.org/abs/1611.08219)". IJCAI, 2017.
- Hadfield-Menell D., Dragan A., Abbeel P., Russell S. "[Cooperative Inverse Reinforcement Learning](https://arxiv.org/abs/1606.03137)". NeurIPS, 2016.
- Orseau L., Armstrong S. "[Safely Interruptible Agents](https://intelligence.org/files/Interruptibility.pdf)". UAI, 2016.
- Russell S. "[Human Compatible: Artificial Intelligence and the Problem of Control](https://openlibrary.org/isbn/9780525558613)". Viking, 2019.
- Christiano P. "[Corrigibility](https://www.alignmentforum.org/posts/fkLYhTQteAu5SinAc/corrigibility)". AI Alignment (Medium), 2017.
