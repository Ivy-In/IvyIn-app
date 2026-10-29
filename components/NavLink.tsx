"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// A link that marks itself as the current page, for screen readers and for the highlight style.
// "exact" links match only their own path, so Home does not light up on every page.
export function NavLink({ href, exact, children }: { href: string; exact?: boolean; children: ReactNode }) {
  const path = usePathname() ?? "";
  const current = exact || href === "/" ? path === href : path === href || path.startsWith(href + "/");
  return (
    <Link href={href} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
