"use client";
import { useRef, useState } from "react";
import { AVATAR_GRADIENTS, MENTORS, TRACKS, personInitials, tracksOf, type Track } from "@/lib/mentors";
import css from "./spotlight.module.css";

// Mentor cards in a sideways carousel, with tabs that filter by field of study.
export function MentorCarousel() {
  const [tab, setTab] = useState<Track | "All">("All");
  const rail = useRef<HTMLDivElement>(null);
  const list = MENTORS.filter((m) => tab === "All" || tracksOf(m.major).includes(tab));
  const step = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <div className={css.carousel}>
      <div className={css.tabs} role="tablist" aria-label="Filter mentors by field">
        {(["All", ...TRACKS] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={css.tab} onClick={() => { setTab(t); rail.current?.scrollTo({ left: 0 }); }}>
            {t}
          </button>
        ))}
      </div>
      <div className={css.rail} ref={rail} tabIndex={0} aria-label={`${list.length} mentors`}>
        {list.map((m, i) => (
          <article key={m.name} className={css.mcard}>
            <span className={css.avBig} style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>{personInitials(m.name)}</span>
            <h3>{m.name}</h3>
            <p className={css.meta}>{m.display ?? m.school} &rsquo;{String(m.year).slice(2)} &middot; {m.major}</p>
            <span className={css.tag}>{m.senior ? "Senior consultant" : "Consultant"}</span>
          </article>
        ))}
      </div>
      <div className={css.arrows}>
        <button onClick={() => step(-1)} aria-label="Previous mentors">&larr;</button>
        <button onClick={() => step(1)} aria-label="Next mentors">&rarr;</button>
      </div>
    </div>
  );
}
