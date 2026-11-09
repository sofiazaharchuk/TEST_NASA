import assert from "node:assert/strict";
import { LEVELS } from "../src/data/levels.ts";
import { newGame, playDay, stars } from "../src/sim/engine.ts";
import { blocksLeft, statusFor, chainSteps, newResource, applyResult, defaultAlloc, stormInfo, randomNick, noActs, taskDone } from "../src/game/logic.ts";
const l0 = LEVELS[0], g0 = newGame(l0);
assert.equal(blocksLeft(l0, g0, defaultAlloc(), noActs), 6, "8 blocks minus 2 for air");
assert.equal(blocksLeft(l0, g0, defaultAlloc(), { ...noActs, science: true }), 5, "science costs a block");
assert.equal(statusFor("air", g0, {}), "danger");
assert.equal(statusFor("air", g0, { air: 2 }), "ok");
assert.equal(statusFor("shield", g0, { shield: 2 }), "ok");
assert.equal(newResource(LEVELS[3], LEVELS[2]), "food");
assert.equal(newResource(LEVELS[4], LEVELS[3]), "water");
assert.equal(newResource(LEVELS[1], LEVELS[0]), null);
const storm = LEVELS[2]; let s = newGame(storm);
while (!s.over) s = playDay(storm, s, { alloc: { air: 2 } });
assert.equal(chainSteps(s)[0], "storm_weak_shield", "most harmful cause first");
assert.ok(chainSteps(s).length <= 4);
const p = applyResult({ unlocked: 0, stars: {} }, 2, storm.id, s, stars(s));
assert.equal(p.unlocked, s.over === "success" ? 3 : 0);
assert.ok(stormInfo(storm, { ...g0, day: 5 }).warn && stormInfo(storm, { ...g0, day: 6 }).hit);
assert.match(randomNick(), /^[A-Z][a-z]+ [A-Z][a-z]+ \d{2}$/);
import { forecast } from "../src/game/logic.ts";
assert.deepEqual(forecast(LEVELS[0], { ...g0, day: 3 }), { type: "micro", today: false });
assert.deepEqual(forecast(LEVELS[0], { ...g0, day: 4 }), { type: "micro", today: true });
assert.equal(forecast(LEVELS[0], { ...g0, day: 1 }), null);
assert.equal(taskDone({ id: "x", kind: "hearts", n: 4 }, g0), true);
assert.equal(taskDone({ id: "x", kind: "science", n: 1 }, g0), false);
assert.equal(taskDone({ id: "x", kind: "noWaste" }, { ...g0, wasted: 2 }), false);
console.log("all logic tests passed");

// Stickers are derived from progress
{
  const { badgesOf } = await import("../src/game/logic.ts");
  const st = (safe: number, smart: number, curious: number) => ({ safe, smart, curious });
  const none = badgesOf({ unlocked: 0, stars: {} }); assert.ok(none.every(b => !b.earned), "a new player has no stickers");
  const some = badgesOf({ unlocked: 3, stars: { first_day: st(3, 3, 1), storm_watch: st(3, 1, 3) }, won: { first_day: true, storm_watch: true } });
  const e = (id: string) => some.find(b => b.id === id)!.earned;
  assert.ok(e("first_flight") && e("storm_survivor") && e("zero_waste") && e("scientist")); assert.ok(!e("gardener") && !e("commander"));
  assert.ok(!badgesOf({ unlocked: 1, stars: { first_day: st(3, 3, 3) } }).some(b => b.earned), "failed or unfinished levels earn nothing");
  console.log("badge tests passed");
}
