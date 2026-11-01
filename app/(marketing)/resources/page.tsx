import type { Metadata } from "next";
import Link from "next/link";
import { PageBody } from "@/components/marketing";
import { JsonLd } from "@/components/JsonLd";
import css from "./resources.module.css";
import { getFaqs, getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resources and FAQ",
  description: "Answers to the questions families ask most about IvyIn college consulting, plus helpful resources.",
  alternates: { canonical: "/resources" },
};

export default async function Resources() {
  const [content, faqs] = await Promise.all([getPage("resources"), getFaqs()]);
  return (
    <PageBody
      content={content}
      art="resources"
      tilt={1}
      afterHero={
        <div className="mk-wrap">
          <Link href="/guides" className={css.guides}>
            <span className={css.text}>
              <span className={css.kicker}>New</span>
              <strong>College admissions guides</strong>
              <span>How to choose a consultant, a ninth grade checklist, and more.</span>
            </span>
            <span className={css.go} aria-hidden="true">Read the guides →</span>
          </Link>
        </div>
      }
    >
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
      <section className="mk-faq">
        <div className="mk-wrap">
          {faqs.length === 0 && <p className="mk-muted">Questions are on their way. Reach out on the Contact page.</p>}
          {faqs.map((f) => (
            <details key={f.question}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </PageBody>
  );
}
