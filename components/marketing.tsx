import Link from "next/link";
import type { ReactNode } from "react";
import type { PageContent } from "@/lib/content";
import { getContext } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/events", label: "Events" },
  { href: "/services", label: "Services" },
  { href: "/resources", label: "Resources / FAQ" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  // Signed-in visitors see a way back into the portal, and a log out button, instead of log in / sign up.
  const ctx = await getContext();
  return (
    <header className="mk-nav">
      <div className="mk-wrap mk-nav-inner">
        <Link href="/" className="mk-brand" aria-label="IvyIn home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-header-light.png" alt="IvyIn" width={1488} height={458} />
        </Link>
        <nav className="mk-links" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
        <div className="mk-auth">
          {ctx ? (
            <>
              <Link className="mk-btn mk-btn-primary" href="/portal">My portal</Link>
              <form action="/logout" method="post" style={{ display: "inline" }}>
                <button className="mk-btn mk-btn-ghost" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link className="mk-btn mk-btn-primary" href="/signup">Sign up</Link>
            </>
          )}
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
        {pills && (
          <div className="mk-cut" aria-hidden="true">
            <svg viewBox="0 0 100 100"><path d="M50 8C70 30 70 55 50 70 30 55 30 30 50 8Z" /><path d="M12 38C38 36 56 52 52 76 26 78 10 62 12 38Z" /><path d="M88 38C62 36 44 52 48 76 74 78 90 62 88 38Z" /></svg>
            <i />
          </div>
        )}
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
