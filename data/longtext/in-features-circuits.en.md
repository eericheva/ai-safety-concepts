### Features and Circuits (Chris Olah et al., OpenAI, 2020)

There is a gesture in the science of neural networks with which everything begins — the gesture of zooming in. Not "what the network does," but "what the mechanism behind it is made of." That is exactly the name of the programmatic paper from Chris Olah's group — "Zoom In": magnify the scale, descend from the level of behavior to the level of substance. And down there, beneath the layer of numbers, what is found is not chaos but a grammar.

Take the vision network InceptionV1 — an old one, trained to recognize images. If you go through its neurons by hand, you find surprisingly comprehensible things. Here is a neuron that lights up on curves of a particular orientation — a curve detector. It responds to an arc turned this way and not that, and goes dark if the arc is mirrored. Here is a neuron responding to fur, to a fluffy texture. Here — to a car wheel, a window, a corner. And here is a dog-snout detector, or rather a whole family of detectors, responding to a snout turned left and, separately, to a snout turned right.

These are **features**. The elementary units of what the network "understands": a stable direction in activation space corresponding to some morsel of meaning — a curvature, a texture, a part of an object.

And now the second gesture, and it matters more than the first. Olah and colleagues look not at the neurons themselves but at **the weights between them**. And it turns out: the car detector on the next layer is assembled from a perfectly readable recipe — strong positive weights run to it from the wheel detector at the bottom of the image and from the window detector at the top. Not the other way around: the wheel is expected below, the glass above. This is no longer a description, it is a mechanism. A subgraph of weights that takes input features and computes an output one from them is a **circuit**. Features are nouns, circuits are verbs. The curve detector on an early layer is itself assembled from circuits connecting detectors of simpler lines and gradients; curve detectors combine into detectors of circles and spirals; and so, layer by layer, from the fine motor skills of vision grows the ability to tell a Labrador from a school bus.

### The mechanism and its significance

Olah's thesis is audacious and simple: neural networks have a *meaningful internal anatomy*, and it can be opened up — not metaphorically but literally, by peering at the weights. Olah puts forward three hypotheses, three pillars.

The first — **features**: the network's activations are not solid mush but a combination of separable, interpretable directions. The second — **circuits**: features are joined by weights into computational subroutines, and these subroutines can be read like little programs. The third, the most ambitious — **universality**: the same features and circuits arise in *different* networks trained independently. Curve detectors are found in AlexNet, in InceptionV1, and in ResNet — as if this were not the quirk of a particular training run but a natural way of solving the problem of vision, toward which all of them converge.

What matters here is not the beauty of individual findings but that a **vocabulary** appears. "Feature" and "circuit" become the basic ontology of a whole field — mechanistic interpretability. Everything written afterward will speak this language: induction heads in transformers are a circuit of two attention heads implementing the rule "if you saw `AB`, and now `A` again, predict `B`"; superposition is about how features are packed into directions; the linear representation hypothesis is a refinement of *what geometry* features have. Olah gave not an answer but a grammar in which questions could be posed.

### How it came about

All of this grew out of feature visualization. Even before "Circuits," Olah's team — first at Google Brain, then at OpenAI — spent years generating images that maximally excite a given neuron, in order to see "what it is looking at." The tool existed, the images were mesmerizing, but this was botany — a herbarium of curious neurons without a theory.

The break came in 2020, in the journal Distill (which Olah co-founded), and "Circuits" came out not as a single paper but as a whole thread. The flagship, "Zoom In: An Introduction to Circuits," lays out the manifesto and the three hypotheses. Alongside it — detailed studies: "Curve Detectors," with almost neurophysiological scrupulousness, proves that curve detectors are real and not imagined; "An Overview of Early Vision" catalogs the first layers of InceptionV1 like an atlas; "Naturally Occurring Equivariance" shows where the rotated copies of a single feature come from. The style was deliberately immodest: the authors appealed directly to early natural science, to the moment when the microscope first revealed the cell. As if to say: we are at the microscope, and there is something alive down there.

Soon the team moved to Anthropic and shifted its focus from vision to language — and so the Transformer Circuits Thread was born, with its "mathematical framework" for transformers ("A Mathematical Framework for Transformer Circuits," 2021) and, in particular, induction heads. But the root is there, in that 2020 work of peering at curves and wheels.

### Criticism / arguments against

**Transferability.** "Circuits" were born on convolutional vision networks, where locality, channels, and comprehensible receptive fields all but invite interpretation. In transformers and large language models, with their residual stream and fully connected layers, everything is murkier: circuits are far less legible, and the method had to be reinvented.

**Polysemanticity and superposition** — the heaviest blow. Circuit analysis most often reads a feature straight off a single neuron: neuron = concept. But a huge share of neurons is **polysemantic** — one and the same neuron lights up on a cat's face, the shiny front of a car, and a cat's legs. The network stores *more* features than it has neurons, smearing them across overlapping directions — this is superposition. And so the neat "neuron-detector" is a happy exception, not the rule, and a naive reading of the weights misleads. Hence the whole subsequent turn toward sparse autoencoders (SAEs): to pull out the "real" monosemantic features, you must first untangle the superposition.

**Universality** remains more a faith than a theorem. Yes, curve detectors recur across networks — but these are the lowest-level, almost forced features. There is only weak evidence for the universality of *high*-level features, where real semantics begins. Plus a general methodological grievance: circuit analysis is manual, expensive, poorly scalable work, and the temptation is strong to see what you want to see — to read a meaningful story where none exists.

### What to do about it

In practice, keep the "features and circuits" ontology as a **framework**, not as a finished map.

Do not identify a feature with a neuron by default — superposition is real; where purity matters, extract features by sparse methods (SAEs and their heirs), not by looking at individual neurons. Treat a circuit you have found as a hypothesis, not a fact: check it *causally* — by ablations, by activation patching — and not only by the sign of the weights; a beautiful story should predict something and break under intervention. Use universality as a search heuristic (found an induction head in one model — look in another), but not as a guarantee. And bear scale in mind: manual analysis is fine for a proof of concept; for large models you need a pipeline and automation.

Finally, know the relatives: the **linear representation hypothesis** refines the idea that features often live along straight directions; John Wentworth's **natural abstraction hypothesis** is the theoretical bet on *why* universality should exist at all. Features and circuits are a language. A literate text has yet to be written in it.

### Sources

- Chris Olah et al. "[Zoom In: An Introduction to Circuits](https://distill.pub/2020/circuits/zoom-in/)." *Distill*, 2020.
- Nick Cammarata et al. "[Curve Detectors](https://distill.pub/2020/circuits/curve-detectors/)." *Distill*, 2020.
- Nelson Elhage et al. "[A Mathematical Framework for Transformer Circuits](https://transformer-circuits.pub/2021/framework/index.html)." *Transformer Circuits Thread*, Anthropic, 2021.
- Nelson Elhage et al. "[Toy Models of Superposition](https://transformer-circuits.pub/2022/toy_model/index.html)." *Transformer Circuits Thread*, Anthropic, 2022.
- Catherine Olsson et al. "[In-context Learning and Induction Heads](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html)." *Transformer Circuits Thread*, Anthropic, 2022.
- Kiho Park, Yo Joong Choe, Victor Veitch. "[The Linear Representation Hypothesis and the Geometry of Large Language Models](https://arxiv.org/abs/2311.03658)." arXiv:2311.03658, 2023.
- Callum McDougall. "[The Natural Abstraction Hypothesis: Implications and Evidence](https://www.lesswrong.com/posts/Fut8dtFsBYRz8atFF/the-natural-abstraction-hypothesis-implications-and-evidence)." *AI Alignment Forum*, 2021.
