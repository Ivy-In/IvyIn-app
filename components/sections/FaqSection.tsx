import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getFaqs } from "@/lib/content";
import { FaqExplorer } from "./FaqExplorer";
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
        <SectionHead eyebrow="Resources / FAQ" title="Frequently Asked Questions" lede="Answers to the questions families ask most." />
        <FaqExplorer faqs={faqs} />
        <p style={{ margin: "32px 0 0" }}>
          <Link className="mk-btn mk-btn-ghost" href="/guides">Read Our College Admissions Guides</Link>
        </p>
      </div>
    </section>
  );
}
