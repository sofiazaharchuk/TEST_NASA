import type { Level } from "../sim/types.ts";
// Game units. Ratios (not absolutes) come from BVAD: water need >> oxygen need > dry food need.
export const ACTIONS = [
  { id: "air", gives: "air", costs: ["power"] },
  { id: "shield", gives: "shield", costs: ["power"] },
  { id: "food", gives: "food", costs: ["power", "water"] },
  { id: "water", gives: "water", costs: ["power"] },
  { id: "science", gives: "science", costs: ["air", "power"] },
  { id: "drone", gives: "science", costs: ["power"] },
  { id: "radio", gives: "help from Earth", costs: ["power"] },
  { id: "shelter", gives: "safety", costs: ["power", "science"] },
  { id: "clean", gives: "energy tomorrow", costs: ["power", "air"] },
  { id: "rest", gives: "heart", costs: ["power"] },
] as const;
const need = { air: 2 };
export const LEVELS: Level[] = [
  { id: "first_day", world: "moon", days: 5, res: ["air", "power", "shield"], income: [6, 6, 6, 6, 6], cap: 3, events: [{ day: 4, type: "micro", warn: 3 }], science: true, need, extras: ["clean"],
    tasks: [{ id: "t1", kind: "science", n: 1 }, { id: "t2", kind: "noWaste" }, { id: "t3", kind: "clean", n: 1 }] },
  { id: "long_night", world: "moon", days: 8, res: ["air", "power", "shield"], income: [6, 6, 6, 0, 0, 0, 6, 6], cap: 6, events: [], science: true, need, extras: ["clean", "rest", "drone"],
    tasks: [{ id: "t1", kind: "science", n: 1 }, { id: "t2", kind: "hearts", n: 4 }, { id: "t3", kind: "air", n: 60 }] },
  { id: "storm_watch", world: "moon", days: 8, res: ["air", "power", "shield"], income: [6, 6, 6, 6, 6, 6, 6, 6], cap: 4, events: [{ day: 6, type: "storm", warn: 5 }], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    tasks: [{ id: "t1", kind: "shield", n: 80 }, { id: "t2", kind: "hearts", n: 4 }, { id: "t3", kind: "science", n: 2 }] },
  { id: "green_thumb", world: "moon", days: 8, res: ["air", "power", "shield", "food"], income: [7, 7, 7, 7, 7, 7, 7, 7], cap: 4, events: [{ day: 7, type: "storm", warn: 6 }], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    tasks: [{ id: "t1", kind: "food", n: 50 }, { id: "t2", kind: "science", n: 1 }, { id: "t3", kind: "hearts", n: 3 }] },
  { id: "thirsty_base", world: "moon", days: 8, res: ["air", "power", "shield", "food", "water"], income: [8, 8, 8, 8, 8, 8, 8, 8], cap: 4, events: [{ day: 6, type: "storm", warn: 5 }], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    tasks: [{ id: "t1", kind: "water", n: 40 }, { id: "t2", kind: "food", n: 40 }, { id: "t3", kind: "hearts", n: 3 }] },
  // ---- Mars: the Sun is weaker (about 6 blocks, not 8) and the sky changes every sol. Plan with the forecast. ----
  { id: "mars_landing", world: "mars", days: 6, res: ["air", "power", "shield", "food", "water"], income: [5, 5, 5, 5, 5, 5], cap: 4, events: [], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    sky: ["clear", "clear", "cold", "clear", "devil", "clear"],
    tasks: [{ id: "t1", kind: "hearts", n: 4 }, { id: "t2", kind: "science", n: 1 }, { id: "t3", kind: "water", n: 30 }] },
  { id: "mars_cold", world: "mars", days: 8, res: ["air", "power", "shield", "food", "water"], income: [5, 5, 5, 5, 5, 5, 5, 5], cap: 5, events: [], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    sky: ["clear", "cold", "cold", "clear", "cold", "cold", "clear", "cold"],
    tasks: [{ id: "t1", kind: "food", n: 40 }, { id: "t2", kind: "hearts", n: 3 }, { id: "t3", kind: "science", n: 1 }] },
  { id: "mars_dust", world: "mars", days: 8, res: ["air", "power", "shield", "food", "water"], income: [6, 6, 6, 6, 6, 6, 6, 6], cap: 5, events: [{ day: 8, type: "storm", warn: 7 }], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    sky: ["clear", "dusty", "dusty", "dusty", "devil", "clear", "dusty", "clear"],
    tasks: [{ id: "t1", kind: "shield", n: 75 }, { id: "t2", kind: "hearts", n: 3 }, { id: "t3", kind: "science", n: 2 }] },
  { id: "mars_global", world: "mars", days: 10, res: ["air", "power", "shield", "food", "water"], income: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6], cap: 8, events: [], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    sky: ["clear", "clear", "dusty", "global", "global", "global", "global", "dusty", "devil", "clear"],
    tasks: [{ id: "t1", kind: "hearts", n: 3 }, { id: "t2", kind: "air", n: 50 }, { id: "t3", kind: "water", n: 30 }] },
  { id: "mars_commander", world: "mars", days: 10, res: ["air", "power", "shield", "food", "water"], income: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6], cap: 6, events: [{ day: 9, type: "storm", warn: 8 }], science: true, need, extras: ["clean", "rest", "drone", "radio"],
    sky: ["clear", "cold", "dusty", "devil", "cold", "dusty", "global", "dusty", "clear", "clear"],
    tasks: [{ id: "t1", kind: "hearts", n: 3 }, { id: "t2", kind: "science", n: 2 }, { id: "t3", kind: "shield", n: 70 }] },
];
