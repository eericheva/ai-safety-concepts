# site/

What https://mrswallbreakermaps.com takes from this repository, and nothing else.

`files` in `site.json` maps each path the site serves for the Bestiary to a path in this
repository; an entry ending in `/` copies that whole folder. The site pins this repository by
commit and copies exactly the listed files at that commit. The two previews are the card images
on the site's home page. On the site the Bestiary is shown to signed-in admins only, with its
own cards, so `site.json` carries no card text of its own beyond the title.
