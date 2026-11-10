import type { Level, Move, Res, State } from "./types.ts";
const c = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export type Weather = "calm" | "minor" | "strong";
/** [safe, hurt] shield thresholds: a stronger real storm demands a stronger shield. */
export const stormThresholds = (w: Weather): [number, number] => (w === "strong" ? [85, 55] : w === "calm" ? [55, 25] : [70, 40]);

export function newGame(_l: Level): State {
  return { day: 1, stock: { air: 70, power: 2, shield: 50, food: 60, water: 60 }, hearts: 4, science: 0, wasted: 0, bonus: 0, cleaned: 0, rested: 0, chain: [], over: null };
}
export function blocksToday(l: Level, s: State) {
  const ev = l.events.find(e => e.day === s.day);
  const inc = ev?.type === "dust" ? Math.floor(l.income[s.day - 1] / 2) : l.income[s.day - 1];
  return inc + s.stock.power + s.bonus;
}
export function playDay(l: Level, s0: State, m: Move, weather: Weather = "minor"): State {
  if (s0.over) return s0;
  const s: State = JSON.parse(JSON.stringify(s0));
  const log = (key: string) => s.chain.push({ day: s.day, key });
  const a = m.alloc;
  const has = (r: string) => (l.res as readonly string[]).includes(r);
  const clean = !!m.clean && l.extras.includes("clean"), rest = !!m.rest && l.extras.includes("rest") && s.hearts < 4, drone = !!m.drone && l.extras.includes("drone") && l.science, radio = !!m.radio && l.extras.includes("radio");
  const used = (a.air ?? 0) + (a.shield ?? 0) + (a.food ?? 0) + (a.water ?? 0) + (m.science ? 1 : 0) + (m.shelter ? 1 : 0) + (clean ? 1 : 0) + (rest ? 1 : 0) + (drone ? 2 : 0) + (radio ? 1 : 0);
  const avail = blocksToday(l, s);
  if (used > avail) throw new Error("not enough energy blocks");
  const left = avail - used;
  s.stock.power = Math.min(l.cap, left);
  s.bonus = 0;
  if (left > l.cap) { s.wasted += left - l.cap; log("battery_full_wasted"); }
  if (l.events.find(e => e.day === s.day)?.type === "dust") log("dust_cut_power");

  let air = a.air ?? 0;
  if (has("water") && s.stock.water < 10) { air = Math.max(0, air - 1); log("water_short"); }
  const need = l.need.air ?? 2;
  if (air >= need) s.stock.air = c(s.stock.air + 5); else { s.stock.air = c(s.stock.air - (need - air) * 12); log("air_short"); }
  if (m.science && l.science) { s.stock.air = c(s.stock.air - 10); s.science += 1; log("science_air_cost"); }
  if (drone) { s.science += 1; log("drone_used"); } // 2 blocks, no air: costs more energy than a walk but is safe
  if (clean) { s.stock.air = c(s.stock.air - 8); s.bonus = 2; s.cleaned += 1; log("clean_air_cost"); }
  if (rest) { s.hearts += 1; s.rested += 1; }
  s.stock.shield = c(s.stock.shield + 15 * (a.shield ?? 0));
  if (has("food")) { s.stock.food = c(s.stock.food - 8 + 10 * (a.food ?? 0)); if (s.stock.food <= 0) { s.hearts -= 1; log("food_short"); } }
  if (has("water")) { s.stock.water = c(s.stock.water - 6 + 8 * (a.water ?? 0) - (a.food ? 3 : 0)); if (s.stock.water <= 0) { s.hearts -= 1; log("water_short"); } }
  if (radio) { // Earth helps the weakest system (+8), but the call costs a block
    const rs = (l.res as Res[]).filter(r => r !== "power"), low = rs.reduce((x, y) => (s.stock[y] < s.stock[x] ? y : x));
    s.stock[low] = c(s.stock[low] + 8); log("radio_used");
  }
  if (s.stock.air <= 0) { s.hearts -= 1; log("air_empty"); }

  const ev = l.events.find(e => e.day === s.day);
  if (ev?.type === "micro") { s.stock.shield = c(s.stock.shield - 20); log("micro_hit"); }
  if (ev?.type === "storm") {
    const [hi, lo] = stormThresholds(weather);
    let loss = s.stock.shield >= hi ? 0 : s.stock.shield >= lo ? 1 : 2;
    if (m.shelter) loss = Math.max(0, loss - 1);
    s.hearts -= loss; log(loss ? "storm_weak_shield" : "storm_ok");
  }
  if (s.hearts <= 0) s.over = "early"; else if (s.day >= l.days) s.over = "success"; else s.day += 1;
  return s;
}
export function stars(s: State) {
  return { safe: s.hearts >= 4 ? 3 : s.hearts >= 3 ? 2 : 1, smart: s.wasted === 0 ? 3 : s.wasted <= 2 ? 2 : 1, curious: s.science >= 2 ? 3 : s.science >= 1 ? 2 : 1 };
}
