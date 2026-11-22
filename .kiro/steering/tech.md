# Tech steering — Pumpkin Patch

## Stack
- Static site: `index.html` + `styles.css` + `app.js`. No build step, no framework, no backend.
- State: `localStorage`, key `pumpkinPatch.v1`, JSON. Save on every mutation.
- Dates: local calendar days as `YYYY-MM-DD` strings. Never use timestamps for streak math (timezones break streaks).
- Visuals: inline SVG only. No external images. Google Fonts ("Creepster") with system-font fallback so core use works offline.

## Rules
- Vanilla JS, ES modules not required — one `app.js` with clear sections: state, dates, lifecycle, render, events.
- All user-facing strings in one `STRINGS` object at the top of `app.js` (epitaphs, haunts, labels) so copy is easy to review.
- Never mutate state without calling `save()` right after.
- Every date comparison goes through `daysBetween(a, b)` — no ad-hoc date math.
- Keep functions small and pure where possible (streak/stage/moon math must be unit-testable without DOM).
- `node --check app.js` must pass; `node test-logic.mjs` must pass before any commit.
