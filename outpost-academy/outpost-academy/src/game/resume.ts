import { LEVELS } from "../data/levels.ts";
import { newGame } from "../sim/engine.ts";
import type { State } from "../sim/types.ts";

export interface Run { levelIdx: number; game: State; weather: "calm" | "minor" | "strong"; weatherSrc: string | null; replay: string | null; miniDone: boolean }
export const normalizeTheme = (v: unknown): "dark" | "light" => (v === "light" ? "light" : "dark");

/**
 * An unfinished level is saved so a page refresh does not throw the child's progress away.
 * Anything saved by an older version or damaged is rejected (returns null) instead of crashing the game.
 */
export function sanitizeRun(raw: unknown): Run | null {
  try {
    const r = raw as Partial<Run> | null;
    if (!r || typeof r !== "object" || !Number.isInteger(r.levelIdx)) return null;
    const level = LEVELS[r.levelIdx as number], g = r.game as unknown as Record<string, unknown> | undefined;
    if (!level || !g || typeof g !== "object") return null;
    const base = newGame(level) as unknown as Record<string, unknown>;
    for (const k of Object.keys(base)) {
      if (base[k] === null || base[k] === undefined) continue;
      if (typeof g[k] !== typeof base[k] || Array.isArray(g[k]) !== Array.isArray(base[k])) return null;
    }
    const s = r.game as State;
    if (s.over) return null;
    if (!Number.isFinite(s.day) || s.day < 1 || s.day > level.days) return null;
    if (!Number.isFinite(s.hearts) || s.hearts < 1 || s.hearts > 4) return null;
    if (!Object.values(s.stock).every(v => Number.isFinite(v) && v >= 0 && v <= 100)) return null;
    for (const k of ["science", "wasted", "bonus", "cleaned", "rested"] as const) if (!Number.isFinite(s[k]) || s[k] < 0) return null;
    if (!s.chain.every(c => c && typeof c.key === "string" && Number.isFinite(c.day))) return null;
    const weather = r.weather === "calm" || r.weather === "strong" ? r.weather : "minor";
    return { levelIdx: r.levelIdx as number, game: s, weather, weatherSrc: typeof r.weatherSrc === "string" ? r.weatherSrc : null, replay: typeof r.replay === "string" ? r.replay : null, miniDone: !!r.miniDone };
  } catch { return null; }
}
