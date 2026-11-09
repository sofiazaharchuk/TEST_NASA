import { create } from "zustand";
import { sfx } from "./lib/sfx.ts";
import { LEVELS } from "./data/levels.ts";
import { newGame, playDay, stars } from "./sim/engine.ts";
import type { Alloc, Res, State } from "./sim/types.ts";
import type { Weather, Source } from "./nasa/donki.ts";
import { DECISIONS, applyDecision, applyQuiz, decisionFor, quizFor, type Decision, type Quiz } from "./game/decisions.ts";
import { applyResult, blocksLeft, defaultAlloc, noActs, randomNick, type Acts, type Progress } from "./game/logic.ts";

export type Mini = "tuner" | "sweep" | "memory";
export type Screen = "start" | "levels" | "intro" | "game" | "debrief" | "settings";
export interface Settings { reduceMotion: boolean; bigText: boolean; easyFont: boolean; readAloud: boolean; together: boolean; demo: boolean; sound: boolean }
export interface Profile { nickname: string; avatar: number; lang: string; started: boolean }
export type Pending = { kind: "decision"; d: Decision } | { kind: "quiz"; q: Quiz } | null;
export interface Report { before: State; after: State }
interface Store {
  screen: Screen; back: Screen; profile: Profile; settings: Settings; progress: Progress;
  levelIdx: number; weather: Weather; weatherSrc: Source | null; replay: string | null; game: State | null; report: Report | null;
  alloc: Alloc; acts: Acts; notice: string | null; pending: Pending; mini: Mini | null; miniDone: boolean;
  openMini: () => void; finishMini: (win: boolean) => void; closeMini: () => void;
  choose: (pick: "a" | "b") => void; answerQuiz: (correct: boolean) => void; closePending: () => void;
  go: (s: Screen) => void; setProfile: (p: Partial<Profile>) => void; setSettings: (s: Partial<Settings>) => void;
  openLevel: (i: number, w?: Weather, src?: Source | null, replay?: string | null) => void; startLevel: () => void; adjust: (r: Res, d: 1 | -1) => void;
  toggle: (k: keyof Acts) => void; closeReport: () => void; endDay: () => void;
}
const KEY = "oa.v1";
const load = () => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const saved = load();
const defaults = {
  profile: { nickname: randomNick(), avatar: 0, lang: "en", started: false } as Profile,
  settings: { reduceMotion: false, bigText: false, easyFont: false, readAloud: false, together: false, demo: false, sound: true } as Settings,
  progress: { unlocked: 0, stars: {} } as Progress,
};

export const useStore = create<Store>()((set, get) => ({
  screen: saved?.profile?.started ? "levels" : "start", back: "levels",
  profile: { ...defaults.profile, ...saved?.profile }, settings: { ...defaults.settings, ...saved?.settings }, progress: { ...defaults.progress, ...saved?.progress },
  levelIdx: 0, weather: "minor", weatherSrc: null, replay: null, game: null, report: null, alloc: defaultAlloc(), acts: noActs, notice: null, pending: null, mini: null, miniDone: false,
  go: screen => set(s => ({ screen, back: screen === "settings" ? s.screen : s.back, notice: null })),
  setProfile: p => set(s => ({ profile: { ...s.profile, ...p } })),
  setSettings: p => set(s => ({ settings: { ...s.settings, ...p } })),
  openLevel: (i, w = "minor", src = null, replay = null) => set({ levelIdx: i, weather: w, weatherSrc: src, replay, screen: "intro" }),
  startLevel: () => set(s => ({ game: newGame(LEVELS[s.levelIdx]), report: null, alloc: defaultAlloc(), acts: noActs, notice: null, screen: "game", pending: null, mini: null, miniDone: false })),
  adjust: (r, d) => {
    const { game, levelIdx, alloc, acts } = get(); if (!game) return;
    if (d > 0 && blocksLeft(LEVELS[levelIdx], game, alloc, acts) <= 0) { set({ notice: "game.noBlocks" }); return; }
    sfx("tick", get().settings.sound);
    set({ alloc: { ...alloc, [r]: Math.max(0, Math.min(6, (alloc[r] ?? 0) + d)) }, notice: null });
  },
  toggle: k => {
    const { game, levelIdx, alloc, acts } = get(); if (!game) return;
    if (!acts[k]) {
      if (k === "rest" && game.hearts >= 4) { set({ notice: "game.notice.rested" }); return; }
      if (blocksLeft(LEVELS[levelIdx], game, alloc, acts) < (k === "drone" ? 2 : 1)) { set({ notice: "game.noBlocks" }); return; }
    }
    sfx("pop", get().settings.sound);
    set({ acts: { ...acts, [k]: !acts[k] }, notice: null });
  },
  closeReport: () => set({ report: null }),
  choose: pick => { const { game, pending, levelIdx } = get(); if (game && pending?.kind === "decision") set({ game: applyDecision(LEVELS[levelIdx], game, pending.d, pick), pending: null }); },
  answerQuiz: correct => { const { game } = get(); if (game) set({ game: applyQuiz(game, correct) }); },
  closePending: () => set({ pending: null }),
  openMini: () => { const { levelIdx, game } = get(); if (game) set({ mini: (["tuner", "sweep", "memory"] as const)[(levelIdx + game.day) % 3] }); },
  closeMini: () => set({ mini: null }),
  finishMini: win => { const { game, settings } = get(); if (!game) return; sfx(win ? "good" : "bad", settings.sound); set({ mini: null, miniDone: true, game: win ? { ...game, bonus: game.bonus + 1 } : game, notice: win ? "mini.win" : "mini.lose" }); },
  endDay: () => {
    const { game, levelIdx, alloc, acts, progress, weather } = get(); if (!game) return;
    const level = LEVELS[levelIdx], next = playDay(level, game, { alloc, ...acts }, weather);
    sfx(next.hearts < game.hearts ? "bad" : "good", get().settings.sound);
    if (next.over) set({ game: next, progress: applyResult(progress, levelIdx, level.id, next, stars(next)), screen: "debrief" });
    else set({ game: next, pending: decisionFor(level, levelIdx, next.day) ? { kind: "decision", d: decisionFor(level, levelIdx, next.day)! } : next.day > 2 ? { kind: "quiz", q: quizFor(levelIdx, next.day) } : null, report: { before: game, after: next }, alloc: defaultAlloc(), acts: noActs, notice: null, miniDone: false });
  },
}));
useStore.subscribe(s => { try { localStorage.setItem(KEY, JSON.stringify({ profile: s.profile, settings: s.settings, progress: s.progress })); } catch { /* storage unavailable */ } });
