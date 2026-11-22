# 🎃 Pumpkin Patch — a habit garden

**Kiroween 2026 — Costume Contest category**

Habit trackers are boring, so people quit them. Pumpkin Patch turns each habit into a plant in a haunted garden: check in daily and it grows from seed → sprout → vine → pumpkin → glowing jack-o'-lantern. Miss a day and it wilts. Miss two and it dies, joining the Graveyard as a tombstone with an epitaph. Harvest at 7 days for a pumpkin; reach 30 days for a rare Golden Pumpkin. A ghost companion reacts to your garden, and the moon waxes and wanes with your weekly consistency.

## Live demo
https://sawi57003-ops.github.io/pumpkin-patch/

## Run it
No build step, no backend, no account. Open `index.html` in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Your garden lives in `localStorage` (`pumpkinPatch.v1`) — it never leaves your browser.

## How it works
- **Plant a habit** — type a name, it appears as a seed.
- **Check in once a day** — streak +1, plant grows a stage.
- **Harvest at 7 days** — +1 pumpkin, plant resets to seed.
- **Golden Pumpkin at 30 days** — a rare trophy plant.
- **Wilt after 1 missed day** — check in today to save it.
- **Death after 2 missed days** — tombstone in the Graveyard with an epitaph; revive in one click.
- **Moon phase** — driven by this week's completion rate (new → full).
- **Ghost companion** — happy when you check in, sad when a plant dies.

## Tests
```bash
node --check app.js
node test-logic.mjs   # 35 checks: streak/stage math, wilt/death boundaries, harvest gating, moon phases
```

## How Kiro was used
This project was built with **Kiro** (spec-driven development):

- **Spec-driven development**: before any code was written, the idea became three Markdown files in `.kiro/specs/pumpkin-patch/` — `requirements.md` (EARS-style requirements), `design.md` (data model, growth stages, wilt rules, moon phase), and `tasks.md` (a checked-off implementation checklist). The code follows the spec; the smoke tests verify the spec's acceptance criteria. This is Kiro's core workflow: spec first, code second.
- **Steering docs** in `.kiro/steering/` (`product.md`, `tech.md`, `structure.md`) kept every decision consistent: vanilla JS, no build step, all copy in one `STRINGS` object, date math only through `daysBetween()`, inline SVG only.
- **Agent hooks** in `.kiro/hooks/hooks.json`: on every JS save, run `node --check app.js` and `node test-logic.mjs` so a broken streak rule can never be committed quietly.
- **Kiro CLI** (`kiro-cli` 3.5.0) is installed on the build machine. The CLI login (free AWS Builder ID, device flow) is the one step that needs the account holder's approval in a browser; once approved, the CLI is used to review the spec, challenge the wilt/death rules, and iterate on the growth-stage math.
- **MCP**: the AWS MCP server is the documented next step (`kiro-cli mcp add --name aws-mcp --url https://aws-mcp.us-east-1.api.aws/mcp`) so Kiro can check current Kiro/Devpost docs instead of guessing.

Compared with vibe coding, the spec-first approach caught two real bugs before they shipped: the wilt rule initially fired even when the user had checked in yesterday, and the week-completion rate counted days before a plant existed. Both were fixed in the spec, then in code, then locked by tests.

## License
MIT — see [LICENSE](LICENSE).
