"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type NavItem = { href: string; label: string };

const idOf = (href: string) => (href === "/" ? "home" : href.replace("/#", ""));

// Top menu for the one-page site. On the home page the link for the section you are reading is marked,
// and it updates as you scroll. On other pages (guides, apply) the links simply lead back to the sections.
export function NavLinks({ items, trailing }: { items: NavItem[]; trailing?: React.ReactNode }) {
  const path = usePathname() ?? "";
  const [active, setActive] = useState("home");

  useEffect(() => {
    if (path !== "/") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let cur = "home";
      for (const it of items) {
        const id = idOf(it.href);
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = id;
      }
      // At the very bottom the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = idOf(items[items.length - 1].href);
      setActive(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [path, items]);

  return (
    <>
      {items.map((n) => (
        <Link key={n.href} href={n.href} aria-current={path === "/" && active === idOf(n.href) ? "page" : undefined}>
          {n.label}
        </Link>
      ))}
      {trailing}
    </>
  );
}
