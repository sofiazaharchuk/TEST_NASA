// Tiny sound effects made with the browser's WebAudio (no files to load). Respects the Sound setting.
export type Sound = "tick" | "pop" | "good" | "bad";
let ctx: AudioContext | null = null;
const NOTES: Record<Sound, number[]> = { tick: [660], pop: [520, 780], good: [523, 659, 784], bad: [220, 165] };
export function sfx(kind: Sound, on: boolean) {
  if (!on) return;
  try {
    if (!ctx) { const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; ctx = new AC(); }
    const c = ctx;
    NOTES[kind].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + i * 0.09;
      o.type = kind === "bad" ? "sawtooth" : "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
      o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + 0.22);
    });
  } catch { /* sound not available */ }
}
