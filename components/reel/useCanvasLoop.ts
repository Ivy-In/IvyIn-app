"use client";
import { useEffect, useRef } from "react";

// Shared plumbing for the 2D canvas scenes: sizes the canvas to its box at a capped pixel ratio,
// runs the draw function only while the canvas is on screen and the tab is visible, and draws a
// single still frame for visitors who prefer reduced motion.
export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, first: boolean) => void;

export function useCanvasLoop(draw: Draw) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = false, first = true;
    const t0 = performance.now();

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      first = true;
      if (reduce || !visible) { drawRef.current(ctx, w, h, 2, true); first = false; }
    };
    const loop = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      drawRef.current(ctx, w, h, (performance.now() - t0) / 1000, first);
      first = false;
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!reduce && visible && !document.hidden && !raf) raf = requestAnimationFrame(loop); };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }, { rootMargin: "100px 0px" });
    io.observe(cv);
    document.addEventListener("visibilitychange", kick);
    size();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", kick); };
  }, []);

  return ref;
}
