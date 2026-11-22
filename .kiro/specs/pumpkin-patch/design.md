# Pumpkin Patch — Kiro Spec: Design

## Overview
A single-page static web app (HTML + CSS + vanilla JS, no build step, no backend). All state lives in `localStorage` under the key `pumpkinPatch.v1`. The app is deployed to GitHub Pages. Visuals are hand-drawn inline SVG (pumpkins, ghosts, moon, tombstones) — no external image assets, so the app works offline.

## Architecture
```
index.html      — structure, mounts the app, loads styles.css + app.js
styles.css      — all styling: dark haunted garden theme, responsive grid
app.js          — state, rendering, check-in/harvest/wilt logic, localStorage
.kiro/specs/    — this spec (requirements, design, tasks)
.kiro/steering/ — product / tech / structure guidance for Kiro
.kiro/hooks/    — agent hook config (format + test on save)
```

## Data model
```js
state = {
  version: 1,
  plants: [
    {
      id: string,            // crypto.randomUUID()
      name: string,
      createdAt: string,     // ISO date
      streak: number,        // consecutive check-in days
      lastCheckIn: string|null, // YYYY-MM-DD
      lastSeen: string,      // YYYY-MM-DD of last garden visit
      wilted: boolean,
      golden: boolean,       // reached 30-day streak
      harvested: number      // pumpkins harvested from this plant
    }
  ],
  graveyard: [
    { id, name, diedAt, epitaph, bestStreak }
  ],
  pumpkins: number,          // total harvested
  hauntsSeen: number
}
```

## Growth stages (by streak)
| Streak | Stage | Visual |
|---|---|---|
| 0 | seed | small mound + seed |
| 1 | seed | mound + sprout tip |
| 2–3 | sprout | green sprout, 2 leaves |
| 4–5 | vine | leafy vine |
| 6 | pumpkin | orange pumpkin |
| 7+ | jack-o'-lantern | glowing carved pumpkin, harvest-ready |
| 30 | golden pumpkin | golden glowing pumpkin (trophy) |

## Wilt / death rules
- On load, for each plant compare `lastSeen` with today:
  - missed 1 day → `wilted = true` (visual wilt, streak kept).
  - missed 2+ days → plant dies: move to `graveyard` with epitaph, remove from plants.
- A check-in clears `wilted`.
- Reviving a tombstone re-plants it as a seed; the tombstone stays in history.

## Moon phase (garden mood)
- Compute this week's completion rate = (check-ins done this week) / (plants × days elapsed this week).
- 0–20% new moon, 20–40% crescent, 40–60% half, 60–80% gibbous, 80–100% full moon.
- Moon rendered as inline SVG; full moon glows.

## Ghost companion
- Inline SVG ghost; states: happy (after a check-in), sad (when a plant dies), idle (default, gentle float animation).
- A rotating "haunt" line (spooky motivational quote) shown under the ghost.

## Styling
- Palette: night sky `#0d0a1a`, soil `#1a1025`, pumpkin orange `#ff7a1a`, ghost white `#f5f0ff`, moon `#ffe9a3`, vine green `#4ade80`, tombstone gray `#8a8a9e`.
- Fonts: "Creepster" (display, Google Fonts with system fallback) + system sans for body.
- Layout: header (title + moon + stats), ghost bar, garden grid (responsive cards), graveyard section, footer.
- Cards: rounded, soil-dark, orange glow on harvest-ready, gray wilt filter when wilted.
- Responsive: 1 column mobile, 2–3 columns desktop.

## Testing
- No test framework (static app). Verification is manual + a Node smoke script (`node --check app.js` and a jsdom-free logic test):
  - `node test-logic.mjs` exercises streak/wilt/harvest math with fake dates.
- Property-style checks in the smoke test: streak never goes negative, harvest only at streak ≥ 7, death only after 2 missed days, localStorage round-trip preserves state.
