import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { GUIDES, getGuide } from "@/lib/guides";
import css from "../guides.module.css";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ivy-in.com";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const date = new Date(`${g.updated}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <article className={css.article}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          dateModified: g.updated,
          mainEntityOfPage: `${BASE}/guides/${g.slug}`,
          author: { "@type": "Organization", name: "IvyIn" },
          publisher: { "@type": "Organization", name: "IvyIn" },
        }}
      />
      <p className={css.meta}><Link href="/guides">All guides</Link> · Updated {date}</p>
      <h1>{g.title}</h1>
      <p style={{ fontSize: "1.2rem" }}>{g.lede}</p>
      {g.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
          {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
        </section>
      ))}
      <div className={`${css.cta} mk-card`}>
        <p>Want a weekly one-on-one with a current student at a top 25 university?</p>
        <Link className="mk-btn mk-btn-primary" href="/#contact">Get in touch</Link>
      </div>
    </article>
  );
}
