# Rescue Horse Search

A single-page tracker for adopting a rescue trail horse within driving range of Buna, TX.
It lists candidate horses from Bluebonnet Equine Humane Society, Habitat for Horses and others,
with status, notes, drive time, rider level, adoption process and the Bluebonnet Expo deadlines
(top-3 choices due Sept 18, 2026; Expo Oct 3, 2026 in Taylor, TX).

## Layout

- `src/data.json` — the horses, rescues, deadlines and checklist
- `src/app.js` — render function (shared by the build and the browser) plus page behaviour
- `src/style.css` — styles, light and dark
- `build.js` — writes `dist/index.html` (standalone; Vercel runs this on every push) and `rescue-horse-search.html` (fragment for the Claude artifact)

## Editing

Change `src/data.json`, then:

```
node build.js
```

to preview `dist/index.html` locally. Commit the source only — Vercel builds `dist/` itself. No dependencies.

## Saving

Status, notes, added horses and checklist ticks are kept in the browser's local storage on the
static site (per device). Inside the Claude artifact runtime the page republishes itself instead.
