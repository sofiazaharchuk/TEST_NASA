interface Props { shield: number; air: number; hearts: number; night: boolean; storm: boolean; food: boolean; water: boolean; animate: boolean; label: string }
/** A living picture of the base: the shield glows with its strength, the windows show the air, the sun hides at night. */
export function BaseScene({ shield, air, hearts, night, storm, food, water, animate, label }: Props) {
  const sh = Math.max(0, Math.min(100, shield)) / 100;
  const win = air < 30 ? "#fb7185" : air < 50 ? "#fbbf24" : "#67e8f9";
  return (
    <svg viewBox="0 0 600 210" role="img" aria-label={label} className="w-full rounded-2xl border border-white/10 bg-slate-950">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020617" /><stop offset="1" stopColor={night ? "#1e1b4b" : "#1e3a8a"} /></linearGradient>
        <radialGradient id="sun"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></radialGradient>
      </defs>
      <rect width="600" height="210" fill="url(#sky)" />
      {[[40, 30], [120, 60], [210, 22], [330, 40], [420, 18], [500, 70], [560, 30], [270, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" opacity={night ? 0.95 : 0.5} />)}
      {!night && <circle cx="540" cy="48" r="22" fill="url(#sun)" />}
      {night && <circle cx="540" cy="48" r="20" fill="#0f172a" stroke="#475569" />}
      <circle cx="70" cy="50" r="16" fill="#38bdf8" /><circle cx="64" cy="46" r="6" fill="#4ade80" opacity=".8" />
      <path d="M0 160 Q150 145 300 158 T600 152 L600 210 L0 210 Z" fill="#94a3b8" />
      <ellipse cx="90" cy="185" rx="26" ry="6" fill="#64748b" /><ellipse cx="520" cy="190" rx="34" ry="7" fill="#64748b" />
      {/* solar panels */}
      {[100, 150].map(x => <g key={x}><rect x={x} y="132" width="38" height="22" rx="3" fill={night ? "#334155" : "#38bdf8"} stroke="#e2e8f0" /><rect x={x + 17} y="154" width="4" height="10" fill="#cbd5e1" /></g>)}
      {/* shield */}
      <path d="M195 158 A105 105 0 0 1 405 158" fill="none" stroke="#818cf8" strokeWidth={3 + sh * 9} opacity={0.12 + sh * 0.88} strokeLinecap="round" />
      {/* dome */}
      <path d="M235 160 A65 65 0 0 1 365 160 Z" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="285" cy="130" r="9" fill={win} opacity=".9" /><circle cx="315" cy="130" r="9" fill={win} opacity=".9" />
      <rect x="292" y="142" width="16" height="18" rx="3" fill="#0f172a" stroke="#e2e8f0" />
      {food && <g><path d="M425 160 A32 32 0 0 1 489 160 Z" fill="#14532d" stroke="#86efac" strokeWidth="2" /><path d="M445 160 v-12 M457 160 v-18 M469 160 v-10" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" /></g>}
      {water && <g><rect x="555" y="130" width="28" height="30" rx="6" fill="#0369a1" stroke="#7dd3fc" strokeWidth="2" /><path d="M569 138 q-5 7 0 11 q5 -4 0 -11" fill="#7dd3fc" /></g>}
      {/* storm particles */}
      {storm && [0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={i} cx={150 + i * 45} cy={20} r="3" fill="#fbbf24">{animate && <animate attributeName="cy" values="10;150" dur={`${1.1 + (i % 3) * 0.3}s`} repeatCount="indefinite" />}</circle>
      ))}
      {/* crew */}
      {[0, 1, 2, 3].map(i => <g key={i}><circle cx={258 + i * 28} cy="186" r="6" fill={i < hearts ? "#fda4af" : "#475569"} /><rect x={252 + i * 28} y="192" width="12" height="12" rx="4" fill={i < hearts ? "#fb7185" : "#334155"} /></g>)}
    </svg>
  );
}
