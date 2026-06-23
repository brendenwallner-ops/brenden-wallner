# Brenden Wallner — portfolio & services site

A single-page marketing site to win freelance app/web development clients.
Pure static HTML/CSS/JS — no build step, no dependencies.

## Run locally
Just open `index.html` in a browser, or serve it:
```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Structure
- `index.html` — all content/sections
- `styles.css` — design system (bold editorial: Archivo Black + Archivo + IBM Plex Mono, red accent on warm paper)
- `script.js` — scroll reveals, nav state, card tilt, contact form
- `assets/` — real project screenshots (Pasiflora, CAIRN, Cadence, Jason)

## Deploy (GitHub Pages — same as Cadence Coffee)
1. Create a repo, push these files.
2. Settings → Pages → deploy from `main` / root.
3. Live at `https://<username>.github.io/<repo>/`.
(Works the same on Vercel/Netlify — drag the folder in.)

## Contact form
Right now the form validates and hands off to a prefilled email
(`mailto:brenden.wallner@gmail.com`) so messages reach you with zero backend.

To make it submit silently in the background instead:
1. Make a free form endpoint (e.g. Formspree) and copy the URL.
2. In `index.html`, set `<form ... action="YOUR_URL" method="POST">`.
3. In `script.js`, replace the `mailto` handoff block with a `fetch(form.action, {...})`.

## Swap in your own work
Each project lives in a `<article class="case">` or `<article class="mini">`.
Replace the image in `assets/` (keep the filename) or edit the copy/chips inline.
