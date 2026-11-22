/* Node smoke tests for Pumpkin Patch lifecycle math (no DOM needed). */
"use strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const m = require("./app.js");

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error("FAIL:", name); }
}

/* stages */
check("streak 0 -> seed", m.stageFor(0, false) === "seed");
check("streak 1 -> seed", m.stageFor(1, false) === "seed");
check("streak 2 -> sprout", m.stageFor(2, false) === "sprout");
check("streak 3 -> sprout", m.stageFor(3, false) === "sprout");
check("streak 4 -> vine", m.stageFor(4, false) === "vine");
check("streak 5 -> vine", m.stageFor(5, false) === "vine");
check("streak 6 -> pumpkin", m.stageFor(6, false) === "pumpkin");
check("streak 7 -> lantern", m.stageFor(7, false) === "lantern");
check("streak 29 -> lantern", m.stageFor(29, false) === "lantern");
check("streak 30 -> golden", m.stageFor(30, false) === "golden");
check("golden flag -> golden", m.stageFor(7, true) === "golden");
check("streak never negative stage", m.stageFor(-1, false) === "seed");

/* dates */
check("daysBetween same day = 0", m.daysBetween("2026-11-22", "2026-11-22") === 0);
check("daysBetween +1", m.daysBetween("2026-11-22", "2026-11-23") === 1);
check("daysBetween across month", m.daysBetween("2026-10-31", "2026-11-02") === 2);
check("addDays", m.addDays("2026-11-22", 3) === "2026-11-25");

/* gap outcomes */
const base = (over) => Object.assign({
  lastSeen: "2026-11-22", lastCheckIn: "2026-11-22", streak: 3,
}, over);
check("no gap -> ok", m.gapOutcome(base({}), "2026-11-22") === "ok");
check("checked in yesterday -> ok", m.gapOutcome(base({ lastSeen: "2026-11-22", lastCheckIn: "2026-11-21" }), "2026-11-22") === "ok");
check("missed 1 day -> wilt", m.gapOutcome(base({ lastSeen: "2026-11-21", lastCheckIn: "2026-11-20" }), "2026-11-22") === "wilt");
check("missed 2 days -> dead", m.gapOutcome(base({ lastSeen: "2026-11-20", lastCheckIn: "2026-11-19" }), "2026-11-22") === "dead");
check("checked in today, stale lastSeen -> ok", m.gapOutcome(base({ lastSeen: "2026-11-20", lastCheckIn: "2026-11-22" }), "2026-11-22") === "ok");

/* check-in / harvest gating */
check("can check in when not done today", m.canCheckIn({ lastCheckIn: "2026-11-21" }, "2026-11-22") === true);
check("cannot check in twice a day", m.canCheckIn({ lastCheckIn: "2026-11-22" }, "2026-11-22") === false);
check("harvest at 7", m.canHarvest({ streak: 7, golden: false }) === true);
check("no harvest at 6", m.canHarvest({ streak: 6, golden: false }) === false);
check("no harvest when golden", m.canHarvest({ streak: 30, golden: true }) === false);

/* moon phase */
check("moon new at 0", m.moonPhase(0) === "new");
check("moon crescent at 0.25", m.moonPhase(0.25) === "crescent");
check("moon half at 0.5", m.moonPhase(0.5) === "half");
check("moon gibbous at 0.7", m.moonPhase(0.7) === "gibbous");
check("moon full at 0.9", m.moonPhase(0.9) === "full");

/* week rate */
const plants = [
  { createdAt: "2026-11-16", lastCheckIn: "2026-11-22" },
  { createdAt: "2026-11-16", lastCheckIn: null },
];
const rate = m.weekRate(plants, "2026-11-22"); // Sunday: 7 days each = 14 possible, 1 done
check("week rate 1/14", Math.abs(rate - 1 / 14) < 1e-9);
check("week rate 0 with no plants", m.weekRate([], "2026-11-22") === 0);

/* epitaph is deterministic per name */
check("epitaph deterministic", m.pickEpitaph("Run") === m.pickEpitaph("Run"));
check("epitaph is a string", typeof m.pickEpitaph("Run") === "string" && m.pickEpitaph("Run").length > 0);

console.log(`smoke tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
