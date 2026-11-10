import type { Level, Res, State } from "../sim/types.ts";
// Mission Control decisions: every option gains something AND loses something (no free choices).
export interface Effect { stock?: Partial<Record<Res, number>>; bonus?: number; hearts?: number; science?: number }
export interface Decision { id: string; a: Effect; b: Effect }
const c = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export const DECISIONS: Decision[] = [
  { id: "airlock", a: { stock: { air: 10 }, bonus: -1 }, b: { bonus: 1, stock: { air: -8 } } },
  { id: "patch", a: { stock: { shield: 15, air: -6 } }, b: { science: 1, stock: { shield: -10 } } },
  { id: "rest", a: { hearts: 1, bonus: -1 }, b: { bonus: 1, stock: { air: -6 } } },
  { id: "solar", a: { bonus: 2, stock: { air: -8 } }, b: { stock: { air: 6 }, bonus: -1 } },
];
/** A decision appears on every second day (not the last one). Deterministic, so it can be tested. */
export function decisionFor(l: Level, levelIdx: number, day: number): Decision | null {
  return day % 2 === 0 && day < l.days ? DECISIONS[(day / 2 + levelIdx) % DECISIONS.length] : null;
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
export interface Quiz { id: string; answer: number; source: string }
export const QUIZ: Quiz[] = [
  { id: "oxygen", answer: 1, source: "bvad" },
  { id: "moxie", answer: 2, source: "moxie" },
  { id: "flare", answer: 0, source: "donki" },
  { id: "delay", answer: 1, source: "hrp-distance" },
];
export const quizFor = (levelIdx: number, day: number): Quiz => QUIZ[(levelIdx + day) % QUIZ.length];
export function applyQuiz(s: State, correct: boolean): State {
  return correct ? { ...s, bonus: s.bonus + 1 } : s;
}
