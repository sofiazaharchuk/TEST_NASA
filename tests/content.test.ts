import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEVELS } from "../src/data/levels.ts";
import { SOURCES } from "../src/data/sources.ts";
import { newGame } from "../src/sim/engine.ts";
import { DECISIONS, QUIZ, applyDecision, applyQuiz, decisionFor } from "../src/game/decisions.ts";
const lang = (c: string) => JSON.parse(readFileSync(new URL(`../src/i18n/${c}.json`, import.meta.url), "utf8"));
const gain = (e: any) => (e.hearts ?? 0) > 0 || (e.bonus ?? 0) > 0 || (e.science ?? 0) > 0 || Object.values(e.stock ?? {}).some((v: any) => v > 0);
const loss = (e: any) => (e.bonus ?? 0) < 0 || Object.values(e.stock ?? {}).some((v: any) => v < 0);
for (const d of DECISIONS) for (const o of [d.a, d.b]) assert.ok(gain(o) && loss(o), `${d.id}: every option must gain AND cost something`);
for (const c of ["en", "uk"]) {
  const t = lang(c);
  for (const d of DECISIONS) { for (const k of ["text", "a", "b", "aWhy", "bWhy"]) assert.ok(t.decision?.[d.id]?.[k], `${c}: decision.${d.id}.${k}`); assert.ok(t.chain?.[`decision_${d.id}`]?.why, `${c}: chain for ${d.id}`); }
  for (const q of QUIZ) { const x = t.quiz?.[q.id]; assert.ok(x?.q && x.why && x.o?.length === 3, `${c}: quiz ${q.id}`); assert.ok(q.answer >= 0 && q.answer < 3); }
}
for (const q of QUIZ) assert.ok(SOURCES.some(s => s.id === q.source), `quiz ${q.id} needs a registered source`);
// Behaviour
const l = LEVELS[2], s = newGame(l);
assert.equal(decisionFor(l, 2, 1), null); assert.equal(decisionFor(l, 2, l.days), null); assert.ok(decisionFor(l, 2, 2));
const patched = applyDecision(l, s, DECISIONS[1], "a");
assert.equal(patched.stock.shield, 65); assert.equal(patched.stock.air, 64); assert.equal(s.stock.shield, 50, "input state is not mutated");
assert.equal(applyDecision(l, { ...s, hearts: 4 }, DECISIONS[2], "a").hearts, 4, "hearts are capped at 4");
assert.equal(applyDecision(l, s, DECISIONS[0], "a").bonus, 0, "bonus never goes below 0");
assert.equal(applyQuiz(s, true).bonus, 1); assert.equal(applyQuiz(s, false).bonus, 0);
console.log("all content tests passed");

// Built-in famous flares: must parse, and must be honest (no fetch time, only date + class)
{
  const { parseFlares, weatherOf } = await import("../src/nasa/donki.ts");
  const b = JSON.parse(readFileSync(new URL("../src/data/donkiBuiltin.json", import.meta.url), "utf8"));
  assert.equal(b.fetchedAt, null);
  const f = parseFlares(b.events);
  assert.equal(f.length, b.events.length, "every built-in flare is well-formed");
  assert.ok(f.every(x => weatherOf(x) === "strong"));
  for (const c of ["en", "uk"]) { const t = lang(c); for (const k of ["coach.title", "coach.air", "coach.shield", "coach.end", "intro.how1", "intro.how2", "intro.how3", "spaceWeather.famous", "game.radio", "chain.radio_used", "scene.night", "scene.day", "mini.play", "mini.win", "mini.lose", "mini.tuner.title", "mini.tuner.help", "mini.sweep.title", "mini.sweep.help", "mini.memory.title", "mini.memory.help", "mini.stop", "mini.tries", "mini.time", "game.step", "game.energyTitle", "game.leftLabel", "game.machines", "game.extra", "game.extraHint", "facts.title", "badges.title", "cert.btn", "cert.title", "cert.text", "replay.title", "replay.text", "replay.chip"]) assert.ok(k.split(".").reduce((o: any, p) => o?.[p], t), `${c}: ${k}`); }
}
console.log("builtin tests passed");

// Facts and stickers
{
  const { FACTS } = await import("../src/data/facts.ts");
  const { BADGE_IDS } = await import("../src/game/logic.ts");
  for (const f of FACTS) assert.ok(SOURCES.some(s => s.id === f.source) || (await import("../src/data/sources.extra.ts")).EXTRA_SOURCES.some((s: { id: string }) => s.id === f.source), `fact ${f.id} needs a registered source`);
  for (const c of ["en", "uk"]) { const t = lang(c); for (const f of FACTS) assert.ok(t.facts?.[f.id], `${c}: facts.${f.id}`); for (const b of BADGE_IDS) { assert.ok(t.badges?.[b]?.name && t.badges?.[b]?.desc, `${c}: badges.${b}`); } }
}
console.log("facts/badges tests passed");
