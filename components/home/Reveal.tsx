"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import css from "./home.module.css";

// Slides content in once it scrolls into view. Content is visible by default (server render, no JS,
// reduced motion) and is only hidden after mount if it starts below the fold.
export function Reveal({
  children, className = "", delay = 0, from = "up",
}: { children: ReactNode; className?: string; delay?: number; from?: "up" | "left" | "right"; }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"show" | "hide" | "in">("show");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("hide");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setState("in"); io.disconnect(); } },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${css.reveal} ${css[`from_${from}`]} ${className}`}
      data-state={state}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
