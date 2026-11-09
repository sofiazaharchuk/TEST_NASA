import assert from "node:assert/strict";
import { LEVELS, ACTIONS } from "../src/data/levels.ts";
import { newGame, playDay, stars } from "../src/sim/engine.ts";
const L = (id: string) => LEVELS.find(l => l.id === id)!;
const run = (id: string, f: (day: number, avail: number) => any) => {
  const l = L(id); let s = newGame(l);
  while (!s.over) { const avail = (l.income[s.day - 1] + s.stock.power); s = playDay(l, s, f(s.day, avail)); }
  return s;
};
// 1. Every action has a real cost (design rule: no free choices)
for (const a of ACTIONS) assert.ok(a.costs.length >= 1, a.id + " must cost something");
// 2. Cannot spend more blocks than available
assert.throws(() => playDay(L("first_day"), newGame(L("first_day")), { alloc: { air: 9 } }), /enough/);
// 3. Long Night: planning ahead beats putting everything into the shield
const planner = run("long_night", d => ({ alloc: { air: 2, shield: d <= 3 ? 1 : 0 } }));
const spender = run("long_night", (d, av) => ({ alloc: { air: d >= 4 && d <= 6 ? 0 : 2, shield: Math.max(0, av - 2) } }));
assert.ok(planner.stock.air > spender.stock.air, "saving battery for night keeps more air");
// 4. Storm Watch: shielding before the forecast storm protects the crew
const ready = run("storm_watch", d => ({ alloc: { air: 2, shield: d >= 4 && d <= 5 ? 4 : 0 } }));
const careless = run("storm_watch", () => ({ alloc: { air: 2 } }));
assert.equal(ready.hearts, 4); assert.ok(careless.hearts < ready.hearts);
assert.ok(careless.chain.some(c => c.key === "storm_weak_shield"), "chain explains the cause");
// 5. Shelter helps but costs a block (science/shield forgone)
const sh = run("storm_watch", d => ({ alloc: { air: 2 }, shelter: d === 6 }));
assert.ok(sh.hearts >= careless.hearts);
// 6. Deterministic and scorable
assert.deepEqual(run("storm_watch", () => ({ alloc: { air: 2 } })), careless);
// 7. New actions: cleaning pays off tomorrow (net +1 block) but costs air; rest heals a heart for one block
import { blocksToday } from "../src/sim/engine.ts";
const f1 = L("first_day"), base = newGame(f1);
const noClean = playDay(f1, base, { alloc: { air: 2 } }), cleaned = playDay(f1, base, { alloc: { air: 2 }, clean: true });
assert.equal(blocksToday(f1, cleaned) - blocksToday(f1, noClean), 2 - 0, "cleaning gives +2 blocks tomorrow (battery already full in both cases)");
assert.equal(noClean.stock.air - cleaned.stock.air, 8, "cleaning costs air");
const ln = L("long_night"), hurt = { ...newGame(ln), hearts: 3 };
assert.equal(playDay(ln, hurt, { alloc: { air: 2 }, rest: true }).hearts, 4, "rest heals one heart");
assert.equal(playDay(ln, newGame(ln), { alloc: { air: 2 }, rest: true }).rested, 0, "no rest needed at full hearts");
console.log("stars", stars(ready), "| careless hearts", careless.hearts);
console.log("all sim tests passed");

// 8. Scout drone: 2 blocks, no air cost, +1 science (safer than a walk, but more energy)
{
  const l = LEVELS.find(x => x.id === "long_night")!, s0 = newGame(l);
  const walk = playDay(l, s0, { alloc: { air: 2 }, science: true }), drone = playDay(l, s0, { alloc: { air: 2 }, drone: true });
  assert.equal(drone.science, 1); assert.equal(walk.science, 1);
  assert.ok(drone.stock.air > walk.stock.air, "drone saves air");
  assert.equal(playDay(LEVELS[0], newGame(LEVELS[0]), { alloc: { air: 2 }, drone: true }).science, 0, "level 1 has no drone");
  assert.throws(() => playDay(l, s0, { alloc: { air: 7 }, drone: true }), /enough/, "drone needs 2 free blocks");
}
console.log("drone tests passed");

// 9. Radio Earth: costs 1 block, helps the weakest system (+8)
{
  const l = LEVELS.find(x => x.id === "storm_watch")!, s0 = newGame(l);
  const plain = playDay(l, s0, { alloc: { air: 2 } }), call = playDay(l, s0, { alloc: { air: 2 }, radio: true });
  assert.equal(call.stock.shield - plain.stock.shield, 8, "shield (50) is the weakest, so it gets +8");
  assert.ok(call.chain.some(x => x.key === "radio_used"));
  assert.equal(playDay(LEVELS[0], newGame(LEVELS[0]), { alloc: { air: 2 }, radio: true }).chain.some(x => x.key === "radio_used"), false, "level 1 has no radio");
}
console.log("radio tests passed");
