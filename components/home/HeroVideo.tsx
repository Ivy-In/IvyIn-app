"use client";
import { useEffect, useRef, useState } from "react";
import { HERO_VIDEOS } from "@/lib/hero-videos";
import css from "./herovideo.module.css";

const MAX_MS = 12000; // longest a clip stays on screen

// Loops campus clips behind the hero. Renders nothing when no clips load, when the visitor prefers
// reduced motion, or when data saver is on, so the gradient hero stays as the fallback.
export function HeroVideo() {
  const [enabled, setEnabled] = useState(false);
  const [bad, setBad] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setEnabled(!reduce && !saver);
  }, []);

  const usable = HERO_VIDEOS.map((_, i) => i).filter((i) => !bad.has(i));
  const current = usable.includes(active) ? active : usable[0];
  const next = usable[(usable.indexOf(current) + 1) % usable.length];

  const advance = () => { setReady(false); setActive(next); };

  useEffect(() => {
    if (!enabled || current === undefined) return;
    const v = refs.current[current];
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    const t = setTimeout(advance, MAX_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, current]);

  if (!enabled || current === undefined) return null;
  const clip = HERO_VIDEOS[current];

  return (
    <div className={css.wrap} aria-hidden="true">
      {HERO_VIDEOS.map((c, i) =>
        bad.has(i) ? null : (
          <video
            key={c.src}
            ref={(el) => { refs.current[i] = el; }}
            className={css.video}
            data-on={i === current && ready}
            src={i === current || i === next ? c.src : undefined}
            muted
            playsInline
            preload={i === current || i === next ? "auto" : "none"}
            tabIndex={-1}
            onPlaying={() => i === current && setReady(true)}
            onEnded={() => i === current && advance()}
            onError={() => setBad((s) => new Set(s).add(i))}
          />
        ),
      )}
      <div className={css.shade} />
      {ready && <p className={css.caption}>{clip.school}</p>}
    </div>
  );
}
