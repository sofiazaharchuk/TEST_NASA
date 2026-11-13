import { Sun, Snowflake, CloudFog, Tornado, Wind, type LucideIcon } from "lucide-react";
import type { Sky } from "../sim/types.ts";
/** One icon and one tint per kind of Mars sky. The icon and the words carry the meaning, the tint only helps. */
export const SKY_ICON: Record<Sky, LucideIcon> = { clear: Sun, cold: Snowflake, dusty: CloudFog, devil: Tornado, global: Wind };
export const SKY_TONE: Record<Sky, string> = { clear: "border-amber-300/40 bg-amber-300/10", cold: "border-sky-300/50 bg-sky-300/10", dusty: "border-orange-400/50 bg-orange-400/10", devil: "border-amber-500/50 bg-amber-500/10", global: "border-red-400/60 bg-red-500/10" };
