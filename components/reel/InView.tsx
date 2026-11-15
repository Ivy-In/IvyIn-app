"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Marks its box with data-in once it scrolls into view, so CSS can play the entrance once.
// Without JavaScript, or with reduced motion, the box is marked straight away and shows its final state.
export function InView({ children, className, threshold = 0.3 }: { children: ReactNode; className?: string; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.setAttribute("data-in", ""); return; }
    el.setAttribute("data-wait", "");
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.setAttribute("data-in", "");
      io.disconnect();
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return <div ref={ref} className={className}>{children}</div>;
}
