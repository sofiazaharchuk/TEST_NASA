import type { Level, Res, State } from "../sim/types.ts";
// Mission Control decisions: every option gains something AND loses something (no free choices).
export interface Effect { stock?: Partial<Record<Res, number>>; bonus?: number; hearts?: number; science?: number }
/** `needs`: the level must have this resource. `world`: only on this world. Without them the decision fits every level. */
export interface Decision { id: string; a: Effect; b: Effect; needs?: Res; world?: "moon" | "mars" }
const c = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export const DECISIONS: Decision[] = [
  { id: "airlock", a: { stock: { air: 10 }, bonus: -1 }, b: { bonus: 1, stock: { air: -8 } } },
  { id: "patch", a: { stock: { shield: 15, air: -6 } }, b: { science: 1, stock: { shield: -10 } } },
  { id: "rest", a: { hearts: 1, bonus: -1 }, b: { bonus: 1, stock: { air: -6 } } },
  { id: "solar", a: { bonus: 2, stock: { air: -8 } }, b: { stock: { air: 6 }, bonus: -1 } },
  { id: "ice", needs: "water", a: { stock: { water: 12 }, bonus: -1 }, b: { bonus: 1, stock: { water: -6 } } },
  { id: "seeds", needs: "food", a: { stock: { food: 12, air: -5 } }, b: { stock: { air: 5, food: -8 } } },
  { id: "moon_soil", world: "moon", a: { stock: { shield: 12 }, bonus: -1 }, b: { bonus: 1, stock: { shield: -8 } } },
  { id: "mars_signal", world: "mars", a: { science: 1, bonus: -1 }, b: { stock: { air: 4, shield: -6 } } },
  { id: "mars_rover", world: "mars", a: { science: 1, stock: { air: -6 } }, b: { bonus: 1, stock: { shield: -5 } } },
];
/** Decisions that make sense on this level (a water decision needs water, a Mars decision needs Mars). */
export const decisionsFor = (l: Level) => DECISIONS.filter(d => (!d.needs || (l.res as readonly string[]).includes(d.needs)) && (!d.world || d.world === l.world));
/** A decision appears on every second day (not the last one). Deterministic, so it can be tested. */
export function decisionFor(l: Level, levelIdx: number, day: number): Decision | null {
  const pool = decisionsFor(l);
  return day % 2 === 0 && day < l.days ? pool[(day / 2 + levelIdx) % pool.length] : null;
}
/** Resources the level does not have are ignored; hearts never exceed 4. */
export function applyDecision(l: Level, s: State, d: Decision, pick: "a" | "b"): State {
  const e = d[pick], n: State = JSON.parse(JSON.stringify(s));
  for (const [r, v] of Object.entries(e.stock ?? {}) as [Res, number][]) if (r !== "power" && (l.res as readonly string[]).includes(r)) n.stock[r] = c(n.stock[r] + v);
  n.bonus = Math.max(0, n.bonus + (e.bonus ?? 0));
  n.hearts = Math.min(4, n.hearts + (e.hearts ?? 0));
  if (l.science) n.science += e.science ?? 0;
  n.chain.push({ day: s.day, key: `decision_${d.id}` });
  return n;
}
// Bonus questions with real science. Answering right gives +1 energy block tomorrow; a wrong answer costs nothing and teaches.
// `world`: "moon" and "mars" questions appear only on that world; "any" appears everywhere. Texts live in i18n under quiz.<id>.
export interface Quiz { id: string; answer: number; source: string; world: "moon" | "mars" | "any" }
export const QUIZ: Quiz[] = [
  { id: "oxygen", answer: 1, source: "bvad", world: "any" },
  { id: "moxie", answer: 2, source: "moxie", world: "any" },
  { id: "flare", answer: 0, source: "donki", world: "any" },
  { id: "delay", answer: 1, source: "hrp-distance", world: "any" },
  { id: "moon_gravity", answer: 0, source: "moon-facts", world: "moon" },
  { id: "moon_night", answer: 1, source: "moon-facts", world: "moon" },
  { id: "moon_air", answer: 2, source: "moon-facts", world: "moon" },
  { id: "moon_ice", answer: 0, source: "moon-facts", world: "moon" },
  { id: "moon_artemis", answer: 1, source: "artemis", world: "moon" },
  { id: "moon_walkers", answer: 2, source: "apollo", world: "moon" },
  { id: "moon_signal", answer: 0, source: "hrp-distance", world: "moon" },
  { id: "moon_sunset", answer: 1, source: "moon-facts", world: "moon" },
  { id: "moon_craters", answer: 0, source: "moon-facts", world: "moon" },
  { id: "moon_dust", answer: 2, source: "moon-facts", world: "moon" },
  { id: "moon_solar", answer: 1, source: "moon-facts", world: "moon" },
  { id: "moon_shield", answer: 0, source: "hrp-radiation", world: "moon" },
  { id: "mars_sol", answer: 0, source: "sol", world: "mars" },
  { id: "mars_red", answer: 1, source: "mars-facts", world: "mars" },
  { id: "mars_airgas", answer: 2, source: "mars-facts", world: "mars" },
  { id: "mars_thin", answer: 0, source: "mars-facts", world: "mars" },
  { id: "mars_chill", answer: 1, source: "mars-facts", world: "mars" },
  { id: "mars_gravity", answer: 2, source: "mars-facts", world: "mars" },
  { id: "mars_year", answer: 0, source: "mars-facts", world: "mars" },
  { id: "mars_devilq", answer: 1, source: "mars-dust", world: "mars" },
  { id: "mars_opportunity", answer: 0, source: "mars-dust", world: "mars" },
  { id: "mars_helicopter", answer: 2, source: "mars-dust", world: "mars" },
  { id: "mars_moons", answer: 1, source: "mars-facts", world: "mars" },
  { id: "mars_water", answer: 0, source: "mars-facts", world: "mars" },
  { id: "mars_trip", answer: 2, source: "mars-facts", world: "mars" },
  { id: "mars_radiation", answer: 1, source: "hrp-radiation", world: "mars" },
  { id: "mars_volcano", answer: 0, source: "mars-facts", world: "mars" },
  { id: "iss_orbit", answer: 2, source: "iss", world: "any" },
  { id: "iss_float", answer: 1, source: "iss", world: "any" },
  { id: "iss_water", answer: 1, source: "eclss", world: "any" },
  { id: "iss_lettuce", answer: 2, source: "veggie", world: "any" },
  { id: "sun_light", answer: 1, source: "sun-facts", world: "any" },
  { id: "sun_cme", answer: 0, source: "donki", world: "any" },
  { id: "sun_aurora", answer: 2, source: "donki", world: "any" },
  { id: "plants_base", answer: 1, source: "veggie", world: "any" },
];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
/** The questions a level can ask: its own world plus the general ones. */
export const quizPool = (l: Level) => QUIZ.filter(q => q.world === "any" || q.world === l.world);
/**
 * Deterministic and without repeats inside one level: the step is coprime with the pool size, so every day
 * lands on a different question, and different levels start at different places.
 */
export function quizFor(l: Level, levelIdx: number, day: number): Quiz {
  const pool = quizPool(l);
  let step = 7; while (gcd(step, pool.length) !== 1) step++;
  return pool[(levelIdx * 5 + day * step) % pool.length];
}
export function applyQuiz(s: State, correct: boolean): State {
  return correct ? { ...s, bonus: s.bonus + 1 } : s;
}
