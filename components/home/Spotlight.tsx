"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AVATAR_GRADIENTS, MENTORS, SCHOOLS, personInitials } from "@/lib/mentors";
import css from "./spotlight.module.css";

const SLOTS = ["tl", "tr", "bl", "br"] as const;

// A big university name that keeps changing, with mentor cards that swap around it.
export function Spotlight() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % SCHOOLS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const school = SCHOOLS[i].school;
  const base = Math.max(0, MENTORS.findIndex((m) => m.school === school));

  return (
    <section className={css.spot} aria-labelledby="spot-h">
      <div className={css.inner}>
        <h2 id="spot-h" className={css.title}>Meet the Mentors Who Just Went Through It, and Got In</h2>
        <p className="sr-only" style={{ position: "absolute", left: -9999 }}>
          Our mentors attend {SCHOOLS.map((s) => s.school).join(", ")}.
        </p>
        <div className={css.big} style={{ "--len": school.length } as React.CSSProperties} aria-hidden="true"><span key={school}>{school}</span></div>
        <Link className="mk-btn mk-btn-ghost" href="/#about">See Where All Our Mentors Study</Link>
      </div>

      <div aria-hidden="true">
        {SLOTS.map((slot, k) => {
          // The first card is from the school on screen; the others are other mentors, so the corners differ.
          const m = MENTORS[(base + k * 7) % MENTORS.length];
          return (
            <div key={`${slot}-${school}`} className={`${css.card} ${css[slot]}`} style={{ animationDelay: `${k * 140}ms` }}>
              <span className={css.av} style={{ background: AVATAR_GRADIENTS[(i + k) % AVATAR_GRADIENTS.length] }}>{personInitials(m.name)}</span>
              <span>
                <strong>{m.name}</strong>
                <small>{m.display ?? m.school} &rsquo;{String(m.year).slice(2)}</small>
                <small>{m.major}</small>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
