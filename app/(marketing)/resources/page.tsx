import type { Metadata } from "next";
import { PageBody } from "@/components/marketing";
import { getFaqs, getPage } from "@/lib/content";

export const metadata: Metadata = { title: "Resources and FAQ | IvyIn" };

export default async function Resources() {
  const [content, faqs] = await Promise.all([getPage("resources"), getFaqs()]);
  return (
    <PageBody content={content}>
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
