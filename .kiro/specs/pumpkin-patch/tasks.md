# Pumpkin Patch — Kiro Spec: Tasks

- [x] 1. Scaffold the project
  - Create `index.html`, `styles.css`, `app.js`, `README.md`, `LICENSE` (MIT)
  - Create `.kiro/specs/pumpkin-patch/` (requirements, design, tasks)
  - Create `.kiro/steering/` (product, tech, structure)
  - Create `.kiro/hooks/` (hook config)
  - _Requirements: 7.1_

- [x] 2. Implement state + persistence
  - State shape per design.md; `load()` / `save()` with `localStorage` key `pumpkinPatch.v1`
  - Date helpers: `todayStr()`, `daysBetween()`, week completion rate
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Implement plant lifecycle
  - Plant a habit (validate non-empty name), render seed card
  - Check-in once per day; streak +1; stage from streak (seed/sprout/vine/pumpkin/jack-o'-lantern)
  - Harvest at streak 7 (pumpkins +1, reset to seed); Golden Pumpkin at streak 30
  - Wilt after 1 missed day; death after 2 missed days → Graveyard + epitaph
  - Revive from Graveyard
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 4. Implement garden mood
  - Moon phase from week completion rate (SVG moon, 5 phases)
  - Ghost companion states (idle / happy / sad) + rotating haunt lines
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Implement visuals
  - Inline SVG: seed, sprout, vine, pumpkin, jack-o'-lantern, golden pumpkin, ghost, moon phases, tombstone
  - Haunted theme CSS (dark, fog, glow), responsive grid, wilt filter, harvest glow
  - _Requirements: 2.4, 4.1_

- [x] 6. Add smoke tests
  - `node --check app.js`
  - `test-logic.mjs`: streak math, wilt/death boundaries, harvest gating, localStorage round-trip
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 6.1_

- [x] 7. Verify end-to-end in a browser
  - Plant → check in → harvest → miss days → graveyard → revive
  - Confirm no console errors and no network dependency for core use
  - _Requirements: 7.1, 7.2_

- [ ] 8. Deploy + submit
  - Push to public GitHub repo (sawi57003-ops), enable GitHub Pages
  - Record demo video (< 3 min), upload to YouTube (public)
  - Submit to Devpost (Costume Contest) with repo URL, app URL, video, Kiro write-up
  - _Requirements: 7.1_
