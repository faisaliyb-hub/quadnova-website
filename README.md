# QuadNova Tech Solutions website

The public website for QuadNova Tech Solutions, part of QuadNova Ventures Ltd (RC 9199792), served at https://quadnova.space by GitHub Pages.

Plain HTML, CSS and JavaScript with no build step. Edit the files and push to `main`; the site updates in a minute or two.

| File | What it is |
|---|---|
| `index.html` | Home page: services (four pillars), AI agents, technology, how it works, about, contact |
| `privacy.html` | Privacy policy (needed for the Meta / WhatsApp app) |
| `terms.html` | Terms of service |
| `styles.css` | All styles and animations (brand v3: light, Nova Blue, aurora light, liquid glass) |
| `site.js` | Menu, scroll reveals, glass highlights, live WhatsApp chat demo |
| `assets/` | Favicon, touch icon, share image (`og-image.png`), Geist fonts |
| `CNAME` | Tells GitHub Pages to use quadnova.space |

The logo, colours, fonts and motion come from the QuadNova brand kit (`quadnova-brand/`, built with `brand.mjs`). The logo lives inline in each page as SVG symbols (`qn-lockup`, `qn-mark`, `qn-quarters`); to update it, run `node site-assets.mjs` in the brand kit and paste the new symbols.
