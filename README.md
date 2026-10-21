# Alignment Bestiary

A map of AI safety concepts: **227 concepts** in 13 families, each with a written entry in
Russian and English, its metadata, and its links to neighbours - **795 links** of 27 kinds.

The project takes two shapes: interactive pages to wander through, and text compendia to read
straight through.

## What is here

- `bestiary-world-map.html` - the 3D world map: every concept is a creature on a landscape of
  families.
- `bestiary-wiki.html` - the searchable wiki of all 227 entries.
- `bestiary-interactives.html` - three interactive views: zooming from the whole bestiary down to
  one beast's pros and cons (what supports it and what argues with it), and ideas followed
  forward and back through their genealogy. It runs on `support.js` and reads
  `data/bestiary-interactives.json`.
- `data/longtext/` - the written entry of each concept, one file per concept in Russian (`.md`)
  and one in English (`.en.md`), 227 of each.
- `assets/` - the creature sprite sheet and the ground textures the map draws.
- `site/` - what https://mrswallbreakermaps.com takes from this repository.

The three pages are self-contained apart from `data/`, `assets/` and `support.js`; serve the
repository root over HTTP and open any of them.

## Licence

CC BY-NC 4.0 for everything here: essays, data, images and page code. See `LICENSE`.
