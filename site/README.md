# site/

What https://mrswallbreakermaps.com takes from this repository, and nothing else.

`files` in `site.json` maps each path the site serves for the Bestiary to a path in this
repository; an entry ending in `/` copies that whole folder. The site pins this repository by
commit and copies exactly the listed files at that commit. The three previews are the card images
on the site's home page. Since 9 November 2026 the site shows the Bestiary to everyone, with its
own cards, so `site.json` carries no card text of its own beyond the title. This folder is released
from `ai-safety-concepts_private`, where the same `site/` folder is the source.
