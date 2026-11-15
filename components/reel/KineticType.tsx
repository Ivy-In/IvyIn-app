"use client";
import { useEffect, useState } from "react";
import css from "./reel.module.css";

// Scene 6 of the reel: a wall of outlined words that drift in alternating directions, with one solid
// ultramarine word in the middle that swaps on the beat. Decorative, so screen readers skip it; the
// same five words are already read out in the hero.
const WORDS = ["Essays", "Applications", "Testing", "Activities", "Deadlines"];
const ROWS = 5;

export function KineticType() {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setK((n) => (n + 1) % WORDS.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <section className={css.kinetic} aria-hidden="true">
      {Array.from({ length: ROWS }, (_, r) => (
        <div key={r} className={css.krow} data-dir={r % 2 ? "r" : "l"}>
          <div className={css.ktrack}>
            {Array.from({ length: 2 }, (_, half) => (
              <span key={half} className={css.khalf}>
                {WORDS.map((w, i) => <span key={i}>{WORDS[(i + r) % WORDS.length]}</span>)}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className={css.kcenter}>
        <span key={k} className={css.kword}>{WORDS[k]}</span>
      </div>
    </section>
  );
}
