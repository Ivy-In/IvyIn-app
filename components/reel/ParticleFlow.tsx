"use client";
import { useRef } from "react";
import { useCanvasLoop } from "./useCanvasLoop";
import css from "./reel.module.css";

// Scene 8 of the reel: thousands of porcelain and ultramarine specks swirling through a flow field.
type P = { x: number; y: number; life: number; blue: boolean };

export function ParticleFlow({ className }: { className?: string }) {
  const parts = useRef<P[]>([]);
  const ref = useCanvasLoop((ctx, w, h, t, first) => {
    const n = Math.round(Math.min(1600, (w * h) / 700));
    if (first || parts.current.length !== n) {
      parts.current = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, life: Math.random() * 300, blue: Math.random() < 0.2 }));
      ctx.clearRect(0, 0, w, h);
    }
    // Fade the previous frame toward transparent, leaving short streaks behind each speck.
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.09)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    const s = 0.0028;
    for (const p of parts.current) {
      const a = Math.sin(p.x * s + t * 0.25) * 2.1 + Math.cos(p.y * s * 1.3 - t * 0.18) * 2.1 + Math.sin((p.x + p.y) * s * 0.6 + t * 0.1);
      const nx = p.x + Math.cos(a) * 1.25, ny = p.y + Math.sin(a) * 1.25;
      ctx.strokeStyle = p.blue ? "rgba(36,76,255,0.95)" : "rgba(232,235,237,0.55)";
      ctx.lineWidth = p.blue ? 1.4 : 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny; p.life -= 1;
      if (p.life < 0 || p.x < -5 || p.x > w + 5 || p.y < -5 || p.y > h + 5) { p.x = Math.random() * w; p.y = Math.random() * h; p.life = 150 + Math.random() * 250; }
    }
  });
  return <canvas ref={ref} className={`${css.fx} ${css.flow} ${className ?? ""}`} aria-hidden="true" />;
}
