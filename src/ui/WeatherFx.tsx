interface Props { kind: "storm" | "dust" | "micro" | null; today: boolean; night: boolean; shieldOk: boolean; animate: boolean }
/** Weather animations over the photo: storm particles + shield ripple, dust clouds, meteors, a dark tint at night. Pure CSS (see index.css). */
export function WeatherFx({ kind, today, night, shieldOk, animate }: Props) {
  if (!animate) return night ? <div aria-hidden className="pointer-events-none absolute inset-0 bg-slate-950/40" /> : null;
  const n = today ? 24 : 12;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {night && <div className="absolute inset-0 bg-slate-950/45" />}
      {kind === "storm" && <>
        {Array.from({ length: n }, (_, i) => <span key={i} className={`absolute top-0 block h-10 w-0.5 rounded bg-gradient-to-b from-amber-200 to-transparent ${i % 2 ? "max-sm:hidden" : ""}`} style={{ left: `${(i * 53) % 100}%`, animation: `fx-fall ${today ? 0.9 + (i % 4) * 0.2 : 1.6 + (i % 4) * 0.3}s linear ${(i % 6) * 0.25}s infinite` }} />)}
        {today && <div className="absolute inset-0 bg-amber-300" style={{ animation: "fx-flash 1.6s ease-in-out infinite" }} />}
        <div className={`absolute left-1/2 top-1/2 h-40 w-40 rounded-full border-4 ${shieldOk ? "border-indigo-300" : "border-rose-400"}`} style={{ animation: "fx-ring 2s ease-out infinite" }} />
      </>}
      {kind === "dust" && Array.from({ length: 9 }, (_, i) => <span key={i} className={`absolute block rounded-full bg-amber-700/50 blur-md ${i % 2 ? "max-sm:hidden" : ""}`} style={{ top: `${10 + (i * 37) % 70}%`, left: "-10%", width: `${60 + (i % 3) * 40}px`, height: `${30 + (i % 3) * 20}px`, animation: `fx-drift ${6 + (i % 4) * 2}s linear ${i * 0.7}s infinite` }} />)}
      {kind === "micro" && Array.from({ length: 4 }, (_, i) => <span key={i} className="absolute block h-1 w-16 rounded bg-gradient-to-r from-transparent to-orange-300" style={{ top: `${5 + i * 18}%`, left: 0, animation: `fx-meteor ${1.1 + i * 0.35}s ease-in ${i * 0.5}s infinite` }} />)}
    </div>
  );
}
