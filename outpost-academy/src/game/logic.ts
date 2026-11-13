import type { Alloc, Level, Res, State, Task } from "../sim/types.ts";
import { blocksToday, stormThresholds, type Weather } from "../sim/engine.ts";
import { LEVELS } from "../data/levels.ts";

export type Status = "ok" | "warn" | "danger";
export interface Progress { unlocked: number; stars: Record<string, { safe: number; smart: number; curious: number }>; won?: Record<string, boolean> }

export const defaultAlloc = (): Alloc => ({ air: 2 });
export interface Acts { science: boolean; shelter: boolean; clean: boolean; rest: boolean; drone: boolean; radio: boolean }
export const noActs: Acts = { science: false, shelter: false, clean: false, rest: false, drone: false, radio: false };
export const used = (a: Alloc, x: Acts) =>
  (a.air ?? 0) + (a.shield ?? 0) + (a.food ?? 0) + (a.water ?? 0) + (x.science ? 1 : 0) + (x.shelter ? 1 : 0) + (x.clean ? 1 : 0) + (x.rest ? 1 : 0) + (x.drone ? 2 : 0) + (x.radio ? 1 : 0);
export const blocksLeft = (l: Level, s: State, a: Alloc, x: Acts) => blocksToday(l, s) - used(a, x);
/** Is a mission task satisfied by the current state? (Shown live in the game and as a result in the debrief.) */
export function taskDone(t: Task, s: State): boolean {
  const n = t.n ?? 1;
  switch (t.kind) {
    case "science": return s.science >= n;
    case "noWaste": return s.wasted === 0;
    case "hearts": return s.hearts >= n;
    case "shield": case "food": case "water": case "air": return s.stock[t.kind] >= n;
    case "clean": return s.cleaned >= n;
    case "rest": return s.rested >= n;
  }
}
export const projectedShield = (s: State, a: Alloc) => Math.min(100, s.stock.shield + 15 * (a.shield ?? 0));

export function statusFor(r: Res, s: State, a: Alloc, w: Weather = "minor"): Status {
  if (r === "air") return (a.air ?? 0) >= 2 ? (s.stock.air < 40 ? "warn" : "ok") : "danger";
  const v = r === "shield" ? projectedShield(s, a) : s.stock[r];
  const [hi, lo] = r === "shield" ? stormThresholds(w) : [40, 15];
  return v >= hi ? "ok" : v >= lo ? "warn" : "danger";
}
export function stormInfo(l: Level, s: State) {
  return { warn: l.events.some(e => e.type === "storm" && e.warn === s.day), hit: l.events.some(e => e.type === "storm" && e.day === s.day) };
}
const PRIORITY = ["storm_weak_shield", "air_empty", "food_short", "water_short", "air_short", "micro_hit", "dust_cut_power", "radio_arrived", "radio_sent", "radio_used", "drone_used", "science_air_cost", "clean_air_cost", "battery_full_wasted", "storm_ok"];
/** What the player should be warned about today: an event tomorrow (warn) or today. */
export function forecast(l: Level, s: State): { type: "storm" | "dust" | "micro"; today: boolean } | null {
  const e = l.events.find(x => x.day === s.day || x.warn === s.day);
  return e ? { type: e.type, today: e.day === s.day } : null;
}
/** Most harmful cause first (then most recent), no duplicates: the order a child reads a Why Chain. */
export function chainSteps(s: State, max = 4): string[] {
  const seen = [...new Set([...s.chain].reverse().map(c => c.key))];
  const rank = (k: string) => { const i = PRIORITY.indexOf(k); return i < 0 ? PRIORITY.length : i; };
  return seen.sort((a, b) => rank(a) - rank(b)).slice(0, max);
}
export function newResource(l: Level, prev?: Level): Res | null {
  return prev ? l.res.find(r => !prev.res.includes(r)) ?? null : null;
}
export function applyResult(p: Progress, idx: number, id: string, s: State, stars: { safe: number; smart: number; curious: number }): Progress {
  const best = p.stars[id], sum = (x: typeof stars) => x.safe + x.smart + x.curious;
  return {
    unlocked: s.over === "success" ? Math.max(p.unlocked, Math.min(idx + 1, LEVELS.length - 1)) : p.unlocked,
    stars: { ...p.stars, [id]: best && sum(best) >= sum(stars) ? best : stars },
    won: { ...(p.won ?? {}), ...(s.over === "success" ? { [id]: true } : {}) },
  };
}
const A = ["Brave", "Swift", "Bright", "Calm", "Bold", "Lucky"], N = ["Comet", "Rocket", "Lunar", "Nova", "Orbit", "Star"];
export const randomNick = (r = Math.random) => `${A[Math.floor(r() * A.length)]} ${N[Math.floor(r() * N.length)]} ${Math.floor(r() * 90 + 10)}`;

/** Stickers are derived from saved progress (nothing extra to store). `won[id]` is set when a level is completed. */
export const BADGE_IDS = ["first_flight", "night_owl", "storm_survivor", "gardener", "water_keeper", "zero_waste", "scientist", "commander", "mars_pioneer"] as const;
export function badgesOf(p: Progress): { id: (typeof BADGE_IDS)[number]; earned: boolean }[] {
  const won = p.won ?? {}, ids = Object.keys(won).filter(k => won[k]), st = (id: string) => p.stars[id];
  const earned: Record<(typeof BADGE_IDS)[number], boolean> = {
    first_flight: ids.length > 0,
    night_owl: !!won.long_night,
    storm_survivor: !!won.storm_watch && st("storm_watch")?.safe === 3,
    gardener: !!won.green_thumb,
    water_keeper: !!won.thirsty_base,
    zero_waste: ids.some(id => st(id)?.smart === 3),
    scientist: ids.some(id => st(id)?.curious === 3),
    commander: LEVELS.filter(l => l.world === "moon").every(l => won[l.id]),
    mars_pioneer: LEVELS.some(l => l.world === "mars" && won[l.id]),
  };
  return BADGE_IDS.map(id => ({ id, earned: earned[id] }));
}
