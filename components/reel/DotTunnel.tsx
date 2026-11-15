"use client";
import { useCanvasLoop } from "./useCanvasLoop";
import css from "./reel.module.css";

// Scene 9 of the reel: concentric rings of evenly spaced dots that rotate and zoom toward the viewer.
export function DotTunnel({ className }: { className?: string }) {
  const ref = useCanvasLoop((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const max = Math.hypot(w, h) / 2;
    const rings = 16;
    const z = (t * 0.22) % 1; // zoom phase
    for (let i = 0; i < rings; i++) {
      const k = (i + z) / rings;            // 0 (centre) .. 1 (edge)
      const r = Math.pow(k, 2.1) * max;
      if (r < 6) continue;
      const count = Math.max(8, Math.round((2 * Math.PI * r) / 16));
      const rot = t * (i % 2 ? 0.14 : -0.1) + i * 0.3;
      const size = 0.6 + k * 2.4;
      const alpha = Math.min(1, k * 1.6) * (1 - Math.max(0, k - 0.85) * 5);
      ctx.fillStyle = i === rings - 4 ? `rgba(36,76,255,${alpha})` : `rgba(232,235,237,${alpha * 0.75})`;
      for (let j = 0; j < count; j++) {
        const a = rot + (j / count) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, size, 0, Math.PI * 2); ctx.fill();
      }
    }
  });
  return <canvas ref={ref} className={`${css.fx} ${css.tunnel} ${className ?? ""}`} aria-hidden="true" />;
}
