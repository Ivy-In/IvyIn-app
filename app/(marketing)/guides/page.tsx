import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import css from "./guides.module.css";

export const metadata: Metadata = {
  title: "College Admissions Guides",
  description: "Plain-language guides for high school students and families on choosing a consultant and preparing for college.",
  alternates: { canonical: "/guides" },
};

export default function Guides() {
  return (
    <>
      <section className="mk-hero">
        <div className="mk-wrap">
          <div className="mk-eyebrow">Guides</div>
          <h1>College admissions, explained</h1>
          <p className="mk-lede">Plain-language guides for students and families.</p>
        </div>
      </section>
      <div className="mk-wrap">
        <div className={css.list}>
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className={`${css.item} mk-card`}>
              <h2>{g.title}</h2>
              <p>{g.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
