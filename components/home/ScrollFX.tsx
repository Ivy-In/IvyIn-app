"use client";
import { useEffect, useRef } from "react";

// The scroll-linked layer: a lime progress bar, depth drift on floating cards, the hero fading back as you leave it,
// the stats band wiping open, speed-skewed headlines, the active "how it works" step, and a lime light under the cursor on cards.
// Everything is skipped for visitors who prefer reduced motion, and the page reads fine without it.
export function ScrollFX() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const q = <T extends HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
    const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

    const drift = q("[data-drift]").map((el) => ({ el, f: Number(el.dataset.drift), sec: el.closest("section") as HTMLElement | null }));
    const wipes = q("[data-wipe]");
    const skews = q("[data-skew]");
    const heroH1 = document.querySelector<HTMLElement>("[data-hero-h1]");
    const orbit = document.querySelector<HTMLElement>("[data-orbit]");
    const heroEl = document.getElementById("home");

    let last = scrollY, skew = 0, raf = 0;

    const frame = () => {
      raf = 0;
      const y = scrollY, vh = innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;

      for (const d of drift) {
        if (!d.sec) continue;
        const r = d.sec.getBoundingClientRect();
        d.el.style.translate = `0 ${(r.top + r.height / 2 - vh / 2) * d.f}px`;
      }

      if (heroEl) {
        const p = clamp(y / (heroEl.offsetHeight * 0.85));
        if (heroH1) { heroH1.style.translate = `0 ${y * 0.16}px`; heroH1.style.opacity = String(1 - p * 0.75); }
        if (orbit) { orbit.style.rotate = `${y * 0.05}deg`; orbit.style.scale = String(1 - p * 0.18); orbit.style.opacity = String(1 - p * 0.6); }
      }

      for (const w of wipes) {
        const r = w.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.3));
        w.style.clipPath = p >= 1 ? "none" : `inset(${(1 - p) * 10}% ${(1 - p) * 8}% 0 ${(1 - p) * 8}%)`;
      }

      const v = y - last; last = y;
      skew += (clamp(v * 0.14, -7, 7) - skew) * 0.18;
      for (const s of skews) s.style.transform = `skewX(${(-skew).toFixed(2)}deg)`;
      if (Math.abs(skew) > 0.02 || Math.abs(v) > 0.5) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick);

    // The step that is crossing the middle of the screen lights up.
    const steps = q("[data-steps] > *");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.toggleAttribute("data-active", e.isIntersecting)),
      { rootMargin: "-40% 0px -40% 0px" },
    );
    steps.forEach((s) => io.observe(s));

    // Lime light that follows the cursor over a card.
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-glow]");
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", move, { passive: true });

    return () => {
      removeEventListener("scroll", kick); removeEventListener("resize", kick);
      document.removeEventListener("pointermove", move); io.disconnect(); cancelAnimationFrame(raf);
      for (const d of drift) d.el.style.translate = "";
      wipes.forEach((w) => (w.style.clipPath = ""));
      skews.forEach((s) => (s.style.transform = ""));
    };
  }, []);

  return <div ref={bar} className="fx-progress" aria-hidden="true" />;
}
