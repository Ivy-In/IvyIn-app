// The marketing pages now live as sections of one scrolling home page.
// Old page paths map to their section so existing links (including ones saved in the CMS) keep working.
const MAP: Record<string, string> = {
  "/about": "/#about",
  "/how-it-works": "/#how-it-works",
  "/events": "/#events",
  "/services": "/#services",
  "/resources": "/#resources",
  "/contact": "/#contact",
};

export function anchorHref(href: string): string {
  return MAP[href] ?? href;
}
