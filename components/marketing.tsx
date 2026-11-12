import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import { anchorHref } from "@/lib/anchors";
import { loadSignature } from "@/lib/mail";
import { titleCase } from "@/lib/titlecase";
import type { ReactNode } from "react";
import type { PageContent } from "@/lib/content";
import { getContext } from "@/lib/auth";
import { HeroMap } from "@/components/home/HeroMap";
import { Words } from "@/components/home/Words";

const NAV = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "Mentors" },
  { href: "/#events", label: "Events" },
  { href: "/#resources", label: "Resources / FAQ" },
  { href: "/#contact", label: "Contact" },
];

export async function Header() {
  // Signed-in visitors see a way back into the portal, and a log out button, instead of log in / sign up.
  const ctx = await getContext();
  return (
    <header className="mk-nav">
      <div className="mk-wrap mk-nav-inner">
        <Link href="/" className="mk-brand" aria-label="IvyIn home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-header-light.png" alt="IvyIn" width={1240} height={458} />
        </Link>
        <nav className="mk-links" aria-label="Main">
          <NavLinks items={NAV} />
        </nav>
        <div className="mk-auth">
          {ctx ? (
            <>
              <Link className="mk-btn mk-btn-primary" href="/portal">My Portal</Link>
              <form action="/logout" method="post" style={{ display: "inline" }}>
                <button className="mk-btn mk-btn-ghost" type="submit">Log Out</button>
              </form>
            </>
          ) : (
            <>
              <Link className="mk-btn mk-btn-ghost" href="/login">Log In</Link>
              <Link className="mk-btn mk-btn-primary" href="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const ICONS = {
  instagram: <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.2-2.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />,
  linkedin: <path d="M4 9h4v11H4V9Zm2-5a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 6 4Zm5 5h3.8v1.6c.6-1.1 2-1.9 3.7-1.9 3.4 0 4 2.2 4 5.2V20h-4v-5.2c0-1.300-.1-2.800-1.900-2.800s-2.100 1.300-2.100 2.700V20h-4V9Z" />,
  whatsapp: <path d="M12 2.5A9.500 9.500 0 0 0 3.800 16.800L2.500 21.500l4.800-1.300A9.500 9.500 0 1 0 12 2.500Zm5.400 13.500c-.2.700-1.300 1.300-1.900 1.400-.5.100-1.200.1-2-.1a14 14 0 0 1-5.700-4.900c-.8-1-1.400-2.200-1.400-3.400s.7-1.800 1-2.100c.2-.2.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.9 2c.1.200.1.400 0 .6l-.4.600-.4.500c-.1.200-.3.300-.1.600.7 1.200 1.700 2.100 3 2.700.3.100.5.100.6-.1l.8-1c.2-.3.400-.2.600-.1l2 .9c.3.200.5.300.5.500.1.300.1.900-.2 1.600Z" />,
};

// Multi-column footer: where to go, ways to get involved, and the social links (edited in the admin Content page).
export async function Footer() {
  const sig = await loadSignature();
  const socials = [["Instagram", sig.instagram, ICONS.instagram], ["LinkedIn", sig.linkedin, ICONS.linkedin], ["WhatsApp", sig.whatsapp, ICONS.whatsapp]] as const;
  return (
    <footer className="mk-footer">
      <div className="mk-wrap" style={{ display: "grid", gap: "32px 48px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", alignItems: "start" }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-header-light.png" alt="IvyIn" width={133} height={49} style={{ height: "auto", marginBottom: 12 }} />
          <p style={{ margin: "0 0 16px", maxWidth: "28ch" }}>{sig.tagline}</p>
          <div style={{ display: "flex", gap: 10 }}>
            {socials.map(([label, href, icon]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ display: "inline-grid", placeItems: "center", width: 40, height: 40, border: "2px solid rgba(232, 235, 237, 0.4)", color: "var(--paper)" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">{icon}</svg>
              </a>
            ))}
          </div>
        </div>
        <nav aria-label="Explore">
          <h2 style={{ fontSize: "1rem", marginBottom: 10, color: "var(--porcelain)" }}>Explore</h2>
          <div style={{ display: "grid", gap: 6 }}>
            {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          </div>
        </nav>
        <nav aria-label="Get involved">
          <h2 style={{ fontSize: "1rem", marginBottom: 10, color: "var(--porcelain)" }}>Get Involved</h2>
          <div style={{ display: "grid", gap: 6 }}>
            <Link href="/apply">Become a Consultant</Link>
            <Link href="/guides">Admissions Guides</Link>
            <Link href="/signup">Sign Up</Link>
            <Link href="/login">Log In</Link>
          </div>
        </nav>
      </div>
      <div className="mk-wrap" style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(232, 235, 237, 0.18)" }}>
        <span>© {new Date().getFullYear()} IvyIn</span>
      </div>
    </footer>
  );
}

export type Art = "about" | "steps" | "events" | "services" | "resources" | "contact";

// Page-specific glyphs for the tilted panel. Each is a simple filled shape in IvyIn green.
const GLYPHS: Record<Art, ReactNode> = {
  about: (<><circle cx="36" cy="34" r="13" /><circle cx="68" cy="40" r="11" /><path d="M10 84C10 60 62 60 62 84Z" /><path d="M50 86C50 68 90 68 90 86Z" /></>),
  steps: (<><rect x="12" y="60" width="22" height="26" /><rect x="39" y="42" width="22" height="44" /><rect x="66" y="22" width="22" height="64" /></>),
  events: (<><path fillRule="evenodd" d="M12 22h76v64H12Z M22 44h56v32H22Z" /><rect x="26" y="10" width="9" height="22" /><rect x="65" y="10" width="9" height="22" /></>),
  services: (<><rect x="12" y="20" width="16" height="16" /><rect x="36" y="20" width="52" height="16" /><rect x="12" y="42" width="16" height="16" /><rect x="36" y="42" width="52" height="16" /><rect x="12" y="64" width="16" height="16" /><rect x="36" y="64" width="52" height="16" /></>),
  resources: (<><path d="M8 24C28 16 42 20 50 30V86C42 76 28 72 8 80Z" /><path d="M92 24C72 16 58 20 50 30V86C58 76 72 72 92 80Z" /></>),
  contact: <path d="M10 16h80v52H50L26 88V68H10Z" />,
};

// The tilted panel from the home page, smaller, with a glyph that matches the page.
export function Cut({ art, tilt = 1 }: { art: Art; tilt?: 1 | 2 | 3 }) {
  return (
    <div className={`mk-cut sm t${tilt}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">{GLYPHS[art]}</svg>
      <i />
    </div>
  );
}

function ctaLink(c: { label: string; href: string }, className: string) {
  return <Link className={className} href={anchorHref(c.href)}>{titleCase(c.label)}</Link>;
}

// Renders CMS-driven page content. children appear after the cards and before the closing band.
export function PageBody({
  content,
  children,
  pills,
  art,
  tilt,
  afterHero,
  heroOnly,
}: {
  content: PageContent;
  children?: ReactNode;
  pills?: { lead: string; items: string[]; tail: string };
  art?: Art;
  tilt?: 1 | 2 | 3;
  afterHero?: ReactNode;
  heroOnly?: boolean;
}) {
  return (
    <>
      <section className="mk-hero">
        {art && !pills && <Cut art={art} tilt={tilt} />}
        {pills && <HeroMap />}
        <div className="mk-wrap">
          {content.eyebrow && <div className="mk-eyebrow">{content.eyebrow}</div>}
          <h1 data-hero-h1={pills ? "" : undefined}>{pills ? <Words text={titleCase(content.headline)} /> : titleCase(content.headline)}</h1>
          {content.lede && <p className="mk-lede">{content.lede}</p>}
          {pills && (
            <p className="mk-pills">
              <span className="mk-pill p0">{pills.lead}</span>
              {pills.items.map((item, i) => (
                <span key={item} className={`mk-pill p${(i % 4) + 1}`}>{item}</span>
              ))}
              <span>{pills.tail}</span>
            </p>
          )}
          {(content.primary || content.secondary) && (
            <div className="mk-actions">
              {content.primary && ctaLink(content.primary, "mk-btn mk-btn-primary")}
              {content.secondary && ctaLink(content.secondary, "mk-btn mk-btn-ghost")}
            </div>
          )}
        </div>
      </section>

      {afterHero}

      {!heroOnly && (<>
      {content.sections.length > 0 && (
        <section className="mk-alt">
          <div className="mk-wrap mk-grid">
            {content.sections.map((s, i) => (
              <div className="mk-card" key={i}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {children}

      {content.closing && (
        <section className="mk-band">
          <div className="mk-wrap">
            <h2>{content.closing.headline}</h2>
            <p>{content.closing.body}</p>
            {ctaLink(content.closing.cta, "mk-btn mk-btn-light")}
          </div>
        </section>
      )}
      </>)}
    </>
  );
}
