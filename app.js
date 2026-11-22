/* Pumpkin Patch — a habit garden. Static, offline-first, localStorage only. */
"use strict";

const STORE_KEY = "pumpkinPatch.v1";

/* ---------- copy (all user-facing strings in one place) ---------- */
const STRINGS = {
  haunts: [
    "The garden remembers. Water it daily.",
    "A pumpkin a day keeps the ghosts at play.",
    "Even ghosts keep their streaks. Do you?",
    "The moon is watching your garden tonight.",
    "Plant a habit. Harvest a legend.",
    "Somewhere, a wilted sprout believes in you.",
    "Seven sunrises stand between you and a jack-o'-lantern.",
    "The fog lifts for those who show up.",
  ],
  epitaphs: [
    "Here lies a good intention. It had potential.",
    "Gone, but not forgotten. Mostly forgotten.",
    "It sprouted. It dreamed. It ghosted.",
    "Watered twice, loved once, missed always.",
    "A habit, interrupted.",
    "It lived fast and wilted faster.",
    "Rest in peas.",
    "The garden keeps its receipts.",
  ],
  stages: {
    seed: "Seed",
    sprout: "Sprout",
    vine: "Vine",
    pumpkin: "Pumpkin",
    lantern: "Jack-o'-lantern",
    golden: "Golden Pumpkin",
  },
};

/* ---------- dates (calendar days as YYYY-MM-DD, timezone-safe) ---------- */
function toDayStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}
function todayStr() { return toDayStr(new Date()); }
function parseDay(s) {
  const parts = s.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
function daysBetween(a, b) {
  const ms = parseDay(b).getTime() - parseDay(a).getTime();
  return Math.round(ms / 86400000);
}
function addDays(dayStr, n) {
  const d = parseDay(dayStr);
  d.setDate(d.getDate() + n);
  return toDayStr(d);
}

/* ---------- pure lifecycle math (DOM-free, unit-testable) ---------- */
function stageFor(streak, golden) {
  if (golden || streak >= 30) return "golden";
  if (streak >= 7) return "lantern";
  if (streak >= 6) return "pumpkin";
  if (streak >= 4) return "vine";
  if (streak >= 2) return "sprout";
  return "seed";
}
/* On load: work out what a missed-day gap does to a plant. */
function gapOutcome(plant, today) {
  if (!plant.lastSeen) return "ok";
  const gap = daysBetween(plant.lastSeen, today);
  if (gap <= 0) return "ok";
  if (gap === 1) {
    // Missed yesterday only if the plant was not checked in yesterday.
    if (plant.lastCheckIn && daysBetween(plant.lastCheckIn, today) <= 1) return "ok";
    return "wilt";
  }
  if (plant.lastCheckIn && daysBetween(plant.lastCheckIn, today) <= 1) return "ok";
  return "dead";
}
function canCheckIn(plant, today) { return plant.lastCheckIn !== today; }
function canHarvest(plant) { return plant.streak >= 7 && !plant.golden; }
function moonPhase(rate) {
  if (rate >= 0.8) return "full";
  if (rate >= 0.6) return "gibbous";
  if (rate >= 0.4) return "half";
  if (rate >= 0.2) return "crescent";
  return "new";
}
function weekRate(plants, today) {
  if (!plants.length) return 0;
  const d = parseDay(today);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  const monday = addDays(today, -dow);
  let done = 0;
  let possible = 0;
  for (const p of plants) {
    const start = p.createdAt > monday ? p.createdAt : monday;
    const days = daysBetween(start, today) + 1;
    possible += Math.max(0, days);
    if (p.lastCheckIn && p.lastCheckIn >= monday) done += 1;
  }
  return possible === 0 ? 0 : done / possible;
}
function pickEpitaph(name) {
  const list = STRINGS.epitaphs;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

/* ---------- state ---------- */
function blankState() {
  return { version: 1, plants: [], graveyard: [], pumpkins: 0, hauntsSeen: 0 };
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blankState();
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || !Array.isArray(s.plants)) return blankState();
    s.graveyard = Array.isArray(s.graveyard) ? s.graveyard : [];
    s.pumpkins = typeof s.pumpkins === "number" ? s.pumpkins : 0;
    return s;
  } catch (e) { return blankState(); }
}
function save(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
}
function newPlant(name) {
  const today = todayStr();
  return {
    id: (crypto.randomUUID ? crypto.randomUUID() : "p" + Date.now() + Math.random().toString(16).slice(2)),
    name: name, createdAt: today, streak: 0,
    lastCheckIn: null, lastSeen: today, wilted: false, golden: false, harvested: 0,
  };
}
function plantHabit(state, name) {
  const clean = String(name || "").trim().slice(0, 60);
  if (!clean) return { ok: false, error: "Give your plant a name first." };
  state.plants.push(newPlant(clean));
  save(state);
  return { ok: true };
}
function checkIn(state, id) {
  const today = todayStr();
  const p = state.plants.find((x) => x.id === id);
  if (!p || !canCheckIn(p, today)) return false;
  p.lastCheckIn = today;
  p.lastSeen = today;
  p.streak += 1;
  p.wilted = false;
  if (p.streak >= 30) p.golden = true;
  save(state);
  return true;
}
function harvest(state, id) {
  const p = state.plants.find((x) => x.id === id);
  if (!p || !canHarvest(p)) return false;
  state.pumpkins += 1;
  p.harvested += 1;
  p.streak = 0;
  p.lastCheckIn = null;
  save(state);
  return true;
}
function revive(state, graveId) {
  const g = state.graveyard.find((x) => x.id === graveId);
  if (!g) return false;
  state.plants.push(newPlant(g.name));
  save(state);
  return true;
}
/* Apply missed-day consequences on load. Returns list of events for the ghost. */
function applyDailyUpkeep(state) {
  const today = todayStr();
  const events = [];
  for (let i = state.plants.length - 1; i >= 0; i--) {
    const p = state.plants[i];
    const outcome = gapOutcome(p, today);
    if (outcome === "wilt") {
      p.wilted = true;
      p.lastSeen = today;
      events.push({ type: "wilt", name: p.name });
    } else if (outcome === "dead") {
      state.graveyard.unshift({
        id: p.id, name: p.name, diedAt: today,
        epitaph: pickEpitaph(p.name), bestStreak: p.streak,
      });
      state.plants.splice(i, 1);
      events.push({ type: "dead", name: p.name });
    } else {
      p.lastSeen = today;
    }
  }
  if (events.length) save(state);
  return events;
}

/* ---------- SVG art (inline, no external assets) ---------- */
function plantSVG(stage, wilted) {
  const w = wilted ? ' opacity="0.45" transform="rotate(8 60 90)"' : "";
  const soil = '<ellipse cx="60" cy="108" rx="42" ry="9" fill="#241a33"/>';
  if (stage === "seed") {
    return '<svg viewBox="0 0 120 120" class="pp-art"' + w + '>' + soil +
      '<circle cx="60" cy="100" r="6" fill="#d9a05b"/><circle cx="60" cy="100" r="2.5" fill="#8a5a2b"/></svg>';
  }
  if (stage === "sprout") {
    return '<svg viewBox="0 0 120 120" class="pp-art"' + w + '>' + soil +
      '<path d="M60 106 Q60 84 60 74" stroke="#4ade80" stroke-width="4" fill="none"/>' +
      '<path d="M60 82 Q44 74 40 60 Q56 62 60 76" fill="#4ade80"/>' +
      '<path d="M60 82 Q76 74 80 60 Q64 62 60 76" fill="#4ade80"/></svg>';
  }
  if (stage === "vine") {
    return '<svg viewBox="0 0 120 120" class="pp-art"' + w + '>' + soil +
      '<path d="M60 106 Q48 88 58 70 Q66 58 56 44" stroke="#4ade80" stroke-width="4" fill="none"/>' +
      '<path d="M58 70 Q40 66 36 50 Q54 52 60 64" fill="#4ade80"/>' +
      '<path d="M56 44 Q70 36 84 38 Q74 50 60 52" fill="#4ade80"/>' +
      '<circle cx="56" cy="44" r="4" fill="#ff7a1a"/></svg>';
  }
  if (stage === "pumpkin" || stage === "lantern" || stage === "golden") {
    const body = stage === "golden" ? "#f5c542" : "#ff7a1a";
    const glow = stage === "lantern" || stage === "golden"
      ? '<ellipse cx="60" cy="92" rx="34" ry="16" fill="#ff7a1a" opacity="0.25"/>'
      : "";
    let face = "";
    if (stage === "lantern") {
      face = '<path d="M42 82 l7 -7 l7 7 z M71 82 l7 -7 l7 7 z" fill="#1a1025"/>' +
        '<path d="M44 96 Q60 106 76 96 Q68 100 60 100 Q52 100 44 96" fill="#1a1025"/>';
    }
    if (stage === "golden") {
      face = '<circle cx="46" cy="84" r="3" fill="#1a1025"/><circle cx="74" cy="84" r="3" fill="#1a1025"/>' +
        '<path d="M48 96 Q60 104 72 96" stroke="#1a1025" stroke-width="3" fill="none"/>';
    }
    return '<svg viewBox="0 0 120 120" class="pp-art"' + w + '>' + soil + glow +
      '<path d="M60 62 Q58 52 62 46" stroke="#4ade80" stroke-width="4" fill="none"/>' +
      '<ellipse cx="60" cy="88" rx="34" ry="26" fill="' + body + '"/>' +
      '<path d="M46 66 Q42 88 46 108 M74 66 Q78 88 74 108" stroke="#e05e00" stroke-width="2" fill="none" opacity="0.6"/>' +
      face + '</svg>';
  }
  return "";
}
function ghostSVG(mood) {
  const mouth = mood === "happy"
    ? '<path d="M52 62 Q60 70 68 62" stroke="#1a1025" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : mood === "sad"
      ? '<path d="M52 66 Q60 58 68 66" stroke="#1a1025" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : '<ellipse cx="60" cy="64" rx="4" ry="5" fill="#1a1025"/>';
  return '<svg viewBox="0 0 120 120" class="pp-ghost-svg">' +
    '<path d="M30 104 Q28 52 60 34 Q92 52 90 104 Q80 94 70 104 Q60 94 50 104 Q40 94 30 104" fill="#f5f0ff"/>' +
    '<circle cx="48" cy="58" r="5" fill="#1a1025"/><circle cx="72" cy="58" r="5" fill="#1a1025"/>' +
    '<circle cx="50" cy="72" r="4" fill="#ffb3c1" opacity="0.7"/><circle cx="70" cy="72" r="4" fill="#ffb3c1" opacity="0.7"/>' +
    mouth + '</svg>';
}
function moonSVG(phase) {
  const cover = { "new": 46, "crescent": 34, "half": 22, "gibbous": 10, "full": -30 }[phase] ?? 46;
  const glow = phase === "full" ? ' filter="drop-shadow(0 0 12px #ffe9a3)"' : "";
  return '<svg viewBox="0 0 120 120" class="pp-moon-svg"' + glow + '>' +
    '<circle cx="60" cy="60" r="42" fill="#ffe9a3"/>' +
    '<circle cx="' + (60 + cover) + '" cy="52" r="38" fill="#0d0a1a"/></svg>';
}
function tombSVG() {
  return '<svg viewBox="0 0 120 120" class="pp-art"><rect x="34" y="34" width="52" height="66" rx="24" fill="#8a8a9e"/>' +
    '<text x="60" y="66" text-anchor="middle" font-size="16" fill="#1a1025">RIP</text>' +
    '<ellipse cx="60" cy="108" rx="42" ry="8" fill="#241a33"/></svg>';
}

/* ---------- rendering (browser only) ---------- */
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function render(state, ghostMood, haunt) {
  const today = todayStr();
  const garden = document.getElementById("garden");
  const stats = document.getElementById("stats");
  const grave = document.getElementById("graveyard");
  const moon = document.getElementById("moon");
  const ghost = document.getElementById("ghost");
  const hauntEl = document.getElementById("haunt");

  const best = state.plants.reduce((m, p) => Math.max(m, p.streak), 0);
  const rate = weekRate(state.plants, today);
  const phase = moonPhase(rate);
  moon.innerHTML = moonSVG(phase);
  document.getElementById("moon-label").textContent =
    "Moon: " + phase + " · " + Math.round(rate * 100) + "% this week";
  ghost.innerHTML = ghostSVG(ghostMood);
  hauntEl.textContent = haunt;

  stats.innerHTML =
    "<span>🎃 <b>" + state.pumpkins + "</b> pumpkins harvested</span>" +
    "<span>🔥 <b>" + best + "</b> best streak</span>" +
    "<span>🌱 <b>" + state.plants.length + "</b> plants growing</span>" +
    "<span>🪦 <b>" + state.graveyard.length + "</b> in the graveyard</span>";

  garden.innerHTML = "";
  if (!state.plants.length) {
    garden.appendChild(el(
      '<div class="pp-empty">Your garden is empty. Plant your first habit and the haunting begins.</div>'
    ));
  }
  for (const p of state.plants) {
    const stage = stageFor(p.streak, p.golden);
    const done = !canCheckIn(p, today);
    const harvestReady = canHarvest(p);
    const card = el(
      '<article class="pp-card' + (p.wilted ? " pp-wilted" : "") + (harvestReady ? " pp-ready" : "") + '">' +
        '<div class="pp-plant">' + plantSVG(stage, p.wilted) + "</div>" +
        '<h3 class="pp-name"></h3>' +
        '<p class="pp-stage">' + STRINGS.stages[stage] + " · 🔥 " + p.streak + " day" + (p.streak === 1 ? "" : "s") + "</p>" +
        (p.wilted ? '<p class="pp-wilt">Wilted — check in today to save it.</p>' : "") +
        '<div class="pp-actions"></div>' +
      "</article>"
    );
    card.querySelector(".pp-name").textContent = p.name;
    const actions = card.querySelector(".pp-actions");
    const btn = document.createElement("button");
    btn.className = "pp-btn";
    btn.textContent = done ? "Checked in ✓" : "Check in";
    btn.disabled = done;
    btn.addEventListener("click", () => { if (checkIn(state, p.id)) { setGhost("happy"); render(state, "happy", randomHaunt()); } });
    actions.appendChild(btn);
    if (harvestReady) {
      const h = document.createElement("button");
      h.className = "pp-btn pp-harvest";
      h.textContent = "Harvest 🎃";
      h.addEventListener("click", () => { if (harvest(state, p.id)) render(state, "happy", "Harvested! A pumpkin joins your haul."); });
      actions.appendChild(h);
    }
    garden.appendChild(card);
  }

  grave.innerHTML = "";
  for (const g of state.graveyard) {
    const t = el(
      '<article class="pp-tomb">' + tombSVG() +
        '<h4 class="pp-tomb-name"></h4>' +
        '<p class="pp-epitaph"></p>' +
        '<p class="pp-tomb-meta">Best streak ' + g.bestStreak + " · died " + g.diedAt + "</p>" +
        '<button class="pp-btn pp-revive">Revive 🌱</button>' +
      "</article>"
    );
    t.querySelector(".pp-tomb-name").textContent = g.name;
    t.querySelector(".pp-epitaph").textContent = "“" + g.epitaph + "”";
    t.querySelector(".pp-revive").addEventListener("click", () => { if (revive(state, g.id)) render(state, "happy", g.name + " rises again."); });
    grave.appendChild(t);
  }
}
function randomHaunt() {
  return STRINGS.haunts[Math.floor(Math.random() * STRINGS.haunts.length)];
}
let ghostMood = "idle";
function setGhost(m) { ghostMood = m; }

/* ---------- boot (browser only) ---------- */
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const state = load();
    const events = applyDailyUpkeep(state);
    if (events.some((e) => e.type === "dead")) setGhost("sad");
    render(state, ghostMood, randomHaunt());
    const form = document.getElementById("plant-form");
    const input = document.getElementById("habit-name");
    const err = document.getElementById("plant-error");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const res = plantHabit(state, input.value);
      if (!res.ok) { err.textContent = res.error; return; }
      err.textContent = "";
      input.value = "";
      render(state, "happy", "A new seed joins the garden.");
    });
  });
}

/* ---------- exports for Node smoke tests ---------- */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    stageFor, gapOutcome, canCheckIn, canHarvest, moonPhase, weekRate,
    pickEpitaph, daysBetween, todayStr, addDays, newPlant, blankState,
  };
}
