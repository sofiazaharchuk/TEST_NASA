export type Res = "air" | "power" | "shield" | "food" | "water";
export type Alloc = Partial<Record<Res, number>>; // energy blocks given to each system; power = battery
export type Extra = "clean" | "rest" | "drone" | "radio";
export interface Task { id: string; kind: "science" | "noWaste" | "hearts" | "shield" | "food" | "water" | "air" | "clean" | "rest"; n?: number }
/** Sky of a Mars sol: clear, cold snap, dusty, dust devil (cleans the panels), global dust storm (sun almost gone). */
export type Sky = "clear" | "cold" | "dusty" | "devil" | "global";
export interface Ev { day: number; type: "storm" | "dust" | "micro"; warn?: number }
export interface Level {
  id: string; world: "moon" | "mars"; days: number; res: Res[];
  income: number[]; cap: number; events: Ev[]; science: boolean; need: Partial<Record<Res, number>>;
  extras: Extra[]; tasks: Task[];
  /** Weather of every day (index 0 = day 1). Missing = clear sky. Used by the Mars levels. */
  sky?: Sky[];
}
export interface Move { alloc: Alloc; science?: boolean; shelter?: boolean; clean?: boolean; rest?: boolean; drone?: boolean; radio?: boolean }
export interface State {
  day: number; stock: Record<Res, number>; hearts: number; science: number; wasted: number;
  bonus: number; cleaned: number; rested: number;
  chain: { day: number; key: string }[]; over: null | "success" | "early";
}
