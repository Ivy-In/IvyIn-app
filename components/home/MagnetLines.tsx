"use client";
import { useEffect, useRef } from "react";

// A field of small bars that all swing to point at the cursor. Bars near the cursor turn ultramarine.
// With no pointer (phones, or before the first move) the aim drifts on its own. Reduced motion gets a still field.
const GAP = 36, LEN = 15, REACH = 190;

export function MagnetLines() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current, host = cv?.parentElement;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, cols = 0, rows = 0, ang: Float32Array, raf = 0, visible = true;
    let tx = -1, ty = -1, lastMove = -1e9;
    const css = getComputedStyle(document.documentElement);
    const porc = css.getPropertyValue("--porcelain").trim() || "#E8EBED";
    const ultra = css.getPropertyValue("--ultra").trim() || "#244CFF";

    const size = () => {
      const r = host.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1;
      ang = new Float32Array(cols * rows);
    };

    const draw = (t: number) => {
      raf = 0;
      // Aim at the pointer, or wander along a slow loop when it has been still for a while.
      let ax = tx, ay = ty;
      if (t - lastMove > 2500 || tx < 0) { ax = w * (0.5 + 0.38 * Math.sin(t / 2600)); ay = h * (0.5 + 0.34 * Math.sin(t / 1900 + 1)); }
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineWidth = 2;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * GAP, y = j * GAP, k = j * cols + i;
        const dx = ax - x, dy = ay - y, want = Math.atan2(dy, dx);
        let d = want - ang[k]; d = Math.atan2(Math.sin(d), Math.cos(d));
        ang[k] += still ? d : d * 0.16;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / REACH);
        const c = Math.cos(ang[k]) * LEN / 2, s = Math.sin(ang[k]) * LEN / 2;
        ctx.strokeStyle = near > 0.02 ? ultra : porc;
        ctx.globalAlpha = near > 0.02 ? 0.45 + 0.55 * near : 0.2;
        ctx.beginPath(); ctx.moveTo(x - c, y - s); ctx.lineTo(x + c, y + s); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!still && visible) raf = requestAnimationFrame(draw);
    };

    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top; lastMove = performance.now();
    };
    const leave = () => { lastMove = -1e9; };

    size();
    draw(performance.now());
    const ro = new ResizeObserver(() => { size(); if (still) draw(0); });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !still) raf = requestAnimationFrame(draw);
    });
    io.observe(host);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", maskImage: "linear-gradient(90deg, rgba(0,0,0,.35), #000 55%)", WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,.35), #000 55%)" }} />;
}
