export type Res = "air" | "power" | "shield" | "food" | "water";
export type Alloc = Partial<Record<Res, number>>; // energy blocks given to each system; power = battery
export type Extra = "clean" | "rest" | "drone" | "radio";
export interface Task { id: string; kind: "science" | "noWaste" | "hearts" | "shield" | "food" | "water" | "air" | "clean" | "rest"; n?: number }
export interface Ev { day: number; type: "storm" | "dust" | "micro"; warn?: number }
export interface Level {
  id: string; world: "moon" | "mars"; days: number; res: Res[];
  income: number[]; cap: number; events: Ev[]; science: boolean; need: Partial<Record<Res, number>>;
  extras: Extra[]; tasks: Task[];
}
export interface Move { alloc: Alloc; science?: boolean; shelter?: boolean; clean?: boolean; rest?: boolean; drone?: boolean; radio?: boolean }
export interface State {
  day: number; stock: Record<Res, number>; hearts: number; science: number; wasted: number;
  bonus: number; cleaned: number; rested: number;
  incomeCut: number; // Mars only: energy blocks lost every sol to dust in the air (clear 0, haze 1, global dust storm 2)
  help?: boolean; // Mars only: a call to Earth was sent, the answer arrives next sol (communication delay)
  chain: { day: number; key: string }[]; over: null | "success" | "early";
}
