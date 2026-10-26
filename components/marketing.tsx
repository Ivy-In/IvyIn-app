import Link from "next/link";
import type { ReactNode } from "react";
import type { PageContent } from "@/lib/content";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/services", label: "Services" },
  { href: "/resources", label: "Resources / FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="mk-nav">
      <div className="mk-wrap mk-nav-inner">
        <Link href="/" className="mk-brand" aria-label="IvyIn home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-header.jpg" alt="IvyIn" width={1550} height={540} />
        </Link>
        <nav className="mk-links" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
        <div className="mk-auth">
          <Link href="/login">Log in</Link>
          <Link className="mk-btn mk-btn-primary" href="/signup">Sign up</Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap mk-footer-grid">
        <span>© {new Date().getFullYear()} IvyIn</span>
        <nav className="mk-links" aria-label="Footer">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
          <Link href="/login">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}

function ctaLink(c: { label: string; href: string }, className: string) {
  return <Link className={className} href={c.href}>{c.label}</Link>;
}

// Renders CMS-driven page content. children appear after the cards and before the closing band.
export function PageBody({
  content,
  children,
  pills,
}: {
  content: PageContent;
  children?: ReactNode;
  pills?: { lead: string; items: string[]; tail: string };
}) {
  return (
    <>
      <section className="mk-hero">
        <div className="mk-wrap">
          {content.eyebrow && <div className="mk-eyebrow">{content.eyebrow}</div>}
          <h1>{content.headline}</h1>
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
    </>
  );
}
