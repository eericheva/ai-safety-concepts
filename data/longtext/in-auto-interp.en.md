### Automated interpretability (Bills et al., OpenAI / Anthropic, 2023)

GPT-2 XL has roughly three hundred thousand neurons. Modern frontier models have hundreds of billions of parameters, and if you decompose the activations through sparse autoencoders, the count runs into tens of millions of features. Now imagine a team of interpreters who honestly, by hand, one by one, work out what each neuron responds to: they look at the dataset examples with maximum activation, formulate a hypothesis, check it. Per neuron — half an hour, optimistically. The three hundred thousand neurons of a single small model would take more than seventeen person-years of continuous work. For a large model — millennia. Manual interpretability does not scale — this is not a slogan but arithmetic.

Hence an idea that is at once elegant and slightly alarming: let AI interpret AI.

The scheme that OpenAI formalized in May 2023 consists of three roles. The first model is the **subject**: the network itself, whose innards we want to read. We take one of its neurons and collect the text fragments on which it activates most strongly. The second model is the **explainer**: it is shown these fragments with their activation numbers and asked to formulate, in natural language, a hypothesis — "this neuron responds to mentions of the time of day," "to closing quotation marks after direct speech," "to words connected with legal liability." The third model is the **simulator**: it is given only the explanation (not the neuron itself!) and a new text, and asked to predict where and how strongly the neuron will light up. Then the predicted activations are compared with the real ones — and the correlation between them becomes a numerical **score of explanation quality**. A good explanation is one from which the neuron's behavior can be reconstructed.

The beauty here is that the whole pipeline can be automated. OpenAI ran GPT-4 in the role of explainer and simulator over all the neurons of GPT-2 XL and released the database of explanations in full. For the first time there appeared not a selective but a *comprehensive* map — crude, in places meaningless, but complete.

### The mechanism and its significance

Anthropic arrived at the same tool from a different angle: sparse autoencoders. In the works "Towards Monosemanticity" (2023) and "Scaling Monosemanticity" (2024) SAEs decompose polysemantic neurons into thousands and millions of cleaner, monosemantic **features**. But there are so many of these features that no one could review them by eye — and Anthropic set up the same trio: a Claude model generates a description of a feature from its top activations, and then checks the description by simulation — predicting activations while seeing only the description itself. This is how one labels features from dictionaries whose count runs into the tens of millions — the neighbors of the famous "Golden Gate Bridge" feature.

Why this matters beyond convenience. Automated interpretability is the only realistic way to "read" a large model as a whole, rather than the odd neuron and a half that happened to catch a researcher's eye. And it converges with a broader program — **scalable oversight**. The logic is the same: if a human cannot keep up with checking a superhumanly productive AI, another AI must be assigned to help. Interpretability carried out by a single pair of human hands is a particular case of the task where a weak overseer must keep watch over a strong overseen party. We do not abolish the human but raise them a level higher: they check not millions of neurons but the work of the checking model.

### How it came about

The roots go deeper than 2023. As far back as 2017 David Bau and colleagues from MIT proposed **Network Dissection** — a method that automatically matched the neurons of convolutional networks to human-understandable visual concepts (detectors of "dog," "sky," "lace"), comparing activation maps with labeled segmentations. This was automation *without* a language-model explainer: the concepts were taken from a predefined vocabulary. The breakthrough of 2023 is that the explainer became a freely speaking LLM — the vocabulary of concepts ceased to be finite, and the hypothesis could be any phrase in English.

The work by Bills, Cammarata, Mossing, Tillman, Gao, Goh, Sutskever, Leike, Wu, and Saunders, "Language models can explain neurons in language models," came out in May 2023 and at once set the methodological standard: explanation + simulation + score. Anthropic built the same loop into its dictionary-learning pipeline, and by 2024 auto-interpretation had turned from a demonstration into working infrastructure: it now underpins the labeling of features, the search for "interesting" directions in the activations, and the first experiments with steering.

### Criticism / arguments against

Here the grown-up conversation begins, and it is merciless.

**The quality of explanations is on average low.** In OpenAI's original work only a small fraction of GPT-2's neurons received explanations with a high simulation score; for the overwhelming majority the correlation was weak. The reason is fundamental: many neurons are **polysemantic** because of superposition — one and the same coordinate answers for several unrelated things at once, because the model packed in more features than it has dimensions. Such a neuron cannot in principle be described by a single short phrase. SAEs mitigate the problem but do not remove it: some features remain murky, and the SAEs themselves introduce reconstruction error and artifacts.

**Convincing does not mean correct.** A language-model explainer is trained to sound coherent. It will readily produce a smooth, plausible description where there is no single regularity at all — interpretability turns into a factory of beautiful, unfalsifiable stories. And a human reading the report is inclined to believe such stories.

**A regress of trust.** We assigned an AI to check an AI — but who checks the checker? The explainer model may err systematically; the simulator may "come to terms" with the explainer on convenient but superficial features. This is the same knot as in the debates about scalable oversight and in the "weak-to-strong" paradigm (weak overseeing strong): the reliability of the whole construction rests on the reliability of the weakest honest link, and we have no formal guarantee that the chain of AI-checks converges to the truth.

**Assessing faithfulness is methodologically hard.** The simulation score checks *correlation*, not *causation*: it says that the explanation predicts the activation, but not that the neuron causally does what is written about it. Huang, Geiger, D'Oosterlinck, Wu, and Potts, in "Rigorously Assessing Natural Language Explanations of Neurons" (2023), showed that the standard metric systematically overstates quality — an explanation may catch surface textual correlates rather than the genuine computational role of the neuron, and under a stricter, intervening (interventional) check many "good" explanations fall apart.

### What to do about it / where it leads

No serious researcher proposes taking auto-explanations at their word — they propose building discipline around them.

First: **causal, not correlational, metrics**. To check an explanation not by simulation but by intervention: silence the neuron/feature, amplify it (steering), substitute counterexamples — and see whether the model's behavior changes the way the explanation promises. This is precisely why Anthropic demonstrates features through active intervention ("Golden Gate Claude") and not only through a list of examples.

Second: **the human as a top-level auditor**, not a labeler. Let the AI generate millions of hypotheses, while humans selectively, statistically validate strata and calibrate their trust in the pipeline. This is exactly the architecture toward which scalable oversight leads: shifting the human from unmanageable operational work onto manageable quality control.

Third: **honestly treat it as a crude instrument**. Auto-interpretability gives not the truth about the model but a cheap, broad first map, by which one can decide where to direct the expensive manual analysis. Like reconnaissance from the air: it does not replace the geologist, but it says where to dig.

Fourth, the strategic point. Automated interpretability is a bet that the understanding of AI can be scaled by the same means by which the AIs themselves are scaled. If the bet pays off, we will have a chance to look inside systems that have long outgrown the human scale. If it does not — we risk getting an industry of convincing explanations that creates the *illusion* of transparency exactly where there is none. And the illusion of understanding is more dangerous than honest ignorance: we make decisions about trust based on it. That is why the field's main question today is not "can AI explain AI" but "can we tell a correct explanation from a beautiful one."

**Sources:**

- Bills, S., Cammarata, N., Mossing, D., Tillman, H., Gao, L., Goh, G., Sutskever, I., Leike, J., Wu, J., Saunders, W. (2023). *[Language models can explain neurons in language models](https://openaipublic.blob.core.windows.net/neuron-explainer/paper/index.html)*. OpenAI.
- Bricken, T. et al. (2023). *[Towards Monosemanticity: Decomposing Language Models With Dictionary Learning](https://transformer-circuits.pub/2023/monosemantic-features/index.html)*. Transformer Circuits Thread, Anthropic.
- Templeton, A. et al. (2024). *[Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html)*. Transformer Circuits Thread, Anthropic.
- Huang, J., Geiger, A., D'Oosterlinck, K., Wu, Z., Potts, C. (2023). *[Rigorously Assessing Natural Language Explanations of Neurons](https://arxiv.org/abs/2309.10312)*. arXiv:2309.10312.
- Bau, D., Zhou, B., Khosla, A., Oliva, A., Torralba, A. (2017). *[Network Dissection: Quantifying Interpretability of Deep Visual Representations](https://openaccess.thecvf.com/content_cvpr_2017/html/Bau_Network_Dissection_Quantifying_CVPR_2017_paper.html)*. CVPR.
