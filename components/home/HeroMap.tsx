"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { LOGOS } from "@/lib/logos";
import { MAP_DOTS, MAP_H, MAP_PINS, MAP_W } from "@/lib/mapdata";
import { STATS } from "@/lib/mentors";
import css from "./heromap.module.css";

// Schools where IvyIn mentors study. Everything else on the map is another top school we know well.
const MENTOR = new Set(["columbia", "cornell", "dartmouth", "michigan", "nyu", "stanford", "tufts", "berkeley", "unc", "usc", "waterloo", "babson", "middlebury", "bowdoin"]);
const NAME = Object.fromEntries(LOGOS.map((l) => [l.slug, l.name]));
// Ivey and Western share a campus, so nudge Ivey so both pins can be seen.
const pins = MAP_PINS.map((p) => (p.slug === "ivey" ? { ...p, x: p.x + 9, y: p.y + 9 } : p));

// A dot-matrix map of the US and Canada. A pin sweeps west to east, showing each school's logo as it lands.
export function HeroMap() {
  const [i, setI] = useState(() => Math.max(0, pins.findIndex((p) => p.slug === "cornell")));
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (hold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % pins.length), 1900);
    return () => clearInterval(t);
  }, [hold]);

  const active = pins[i];
  const ax = (active.x / MAP_W) * 100, ay = (active.y / MAP_H) * 100;
  const side = ax < 22 ? "left" : ax > 78 ? "right" : "mid";

  return (
    <div className={`mk-cut ${css.map}`} data-orbit="" onPointerLeave={() => setHold(false)}>
      <svg className={css.land} viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true" focusable="false">
        <path d={MAP_DOTS} />
      </svg>

      <ul className={css.pins} aria-label="Universities our mentors and students come from">
        {pins.map((p, k) => (
          <li key={p.slug} style={{ left: `${(p.x / MAP_W) * 100}%`, top: `${(p.y / MAP_H) * 100}%` } as CSSProperties}>
            <button
              type="button"
              className={css.pin}
              data-mentor={MENTOR.has(p.slug)}
              data-active={k === i}
              aria-label={NAME[p.slug]}
              onPointerEnter={() => { setI(k); setHold(true); }}
              onFocus={() => { setI(k); setHold(true); }}
              onBlur={() => setHold(false)}
            />
          </li>
        ))}
      </ul>

      <div className={css.tag} data-side={side} style={{ left: `${ax}%`, top: `${ay}%` }} key={active.slug} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/logos/${active.slug}.png`} alt="" />
      </div>

      <p className={css.legend} aria-hidden="true">
        <span><i data-k="m" /> Our mentors</span>
        <span><i data-k="o" /> More top schools</span>
      </p>
      <div className={css.count} aria-hidden="true">
        <b>{STATS.mentors}</b> mentors <b>{STATS.universities}</b> universities
      </div>
    </div>
  );
}
