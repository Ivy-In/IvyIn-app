import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getFaqs } from "@/lib/content";
import { GUIDES } from "@/lib/guides";
import { Reveal } from "@/components/home/Reveal";
import { SectionHead } from "./SectionHead";
import css from "./sections.module.css";

export async function FaqSection() {
  const faqs = await getFaqs();
  return (
    <section id="resources" className={`${css.band} ${css.flat} ${css.grain}`}>
      <div className={css.wrap}>
        {faqs.length > 0 && (
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }}
          />
        )}
        <SectionHead eyebrow="Resources / FAQ" title="Frequently asked questions" lede="Answers to the questions families ask most." />
        <div className="mk-faq" style={{ padding: 0 }}>
          {faqs.length === 0 && <p className="mk-muted">Questions are on their way. Reach out in the Contact section below.</p>}
          {faqs.map((f) => (
            <Reveal key={f.question}>
              <details>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className={css.eyebrow} style={{ marginTop: 56 }}>College admissions guides</h3>
        </Reveal>
        <div className={css.guides}>
          {GUIDES.map((g, i) => (
            <Reveal key={g.slug} delay={i * 110}>
              <Link href={`/guides/${g.slug}`} className={css.guide}>
                <strong>{g.title}</strong>
                <span>{g.description}</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <p style={{ marginTop: 20 }}><Link href="/guides">See all guides →</Link></p>
      </div>
    </section>
  );
}
