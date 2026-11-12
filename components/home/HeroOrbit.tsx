import { AVATAR_GRADIENTS, MENTORS, STATS, personInitials } from "@/lib/mentors";
import css from "./heroorbit.module.css";

// Real mentors, on three rings around the student: the idea is that a student is surrounded by people who just got in.
const RINGS: { r: number; secs: number; names: string[] }[] = [
  { r: 46, secs: 90, names: ["Curtis Lee", "Max Lee", "Grant Lang", "Erwin Wang"] },
  { r: 32, secs: 62, names: ["Annabelle Lei", "Derek Somers", "Evelyn Brown"] },
  { r: 19, secs: 44, names: ["Tommy Li", "Hope Kim"] },
];

const LEAF = "M50 8C70 30 70 55 50 70 30 55 30 30 50 8ZM12 38C38 36 56 52 52 76 26 78 10 62 12 38ZM88 38C62 36 44 52 48 76 74 78 90 62 88 38Z";

export function HeroOrbit() {
  return (
    <div className={`mk-cut ${css.orbit}`} data-orbit="" aria-hidden="true">
      <div className={css.glow} />
      {RINGS.map((ring, ri) => (
        <div key={ri} className={css.ring} style={{ "--r": ring.r, "--d": `${ring.secs}s`, "--dir": ri % 2 ? "reverse" : "normal" } as React.CSSProperties}>
          <span className={css.track} />
          <div className={css.spin}>
            {ring.names.map((n, i) => {
              const m = MENTORS.find((x) => x.name === n)!;
              const a = (360 / ring.names.length) * i + ri * 40;
              return (
                <div key={n} className={css.node} style={{ "--a": `${a}deg` } as React.CSSProperties}>
                  <div className={css.chip} data-big={ri < 2}>
                    <b style={{ background: AVATAR_GRADIENTS[(i + ri * 3) % AVATAR_GRADIENTS.length] }}>{personInitials(m.name)}</b>
                    {ri < 2 && <span>{m.display ?? m.school}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className={css.core}>
        <svg viewBox="0 0 100 100"><path d={LEAF} /></svg>
        <span>You</span>
      </div>
      <div className={css.stat}>
        <strong>{STATS.mentors}</strong><span>mentors</span>
        <strong>{STATS.universities}</strong><span>universities</span>
      </div>
    </div>
  );
}
