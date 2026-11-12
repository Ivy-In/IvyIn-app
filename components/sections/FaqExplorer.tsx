"use client";
import Link from "next/link";
import { useId, useMemo, useState, type ReactNode } from "react";
import css from "./faq.module.css";

type Faq = { question: string; answer: string };

const TOPICS = ["Getting Started", "Pricing and Plans", "Meetings and Platform"] as const;
type Topic = (typeof TOPICS)[number];

// Sorts each question into a topic by its wording, so new questions added in the admin land in a sensible tab.
function topicOf(q: string): Topic {
  if (/(cost|price|pricing|payment|included|introduction call|intro call|refund)/i.test(q)) return "Pricing and Plans";
  if (/(meeting|platform|account|files|messages|events|founders|portal)/i.test(q)) return "Meetings and Platform";
  return "Getting Started";
}

// Questions grouped into topic tabs, with search and a one-at-a-time accordion.
export function FaqExplorer({ faqs, footer }: { faqs: Faq[]; footer?: ReactNode }) {
  const uid = useId();
  const [topic, setTopic] = useState<Topic>("Getting Started");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [all, setAll] = useState(false);

  const withTopic = useMemo(() => faqs.map((f) => ({ ...f, topic: topicOf(f.question) })), [faqs]);
  const counts = useMemo(() => Object.fromEntries(TOPICS.map((t) => [t, withTopic.filter((f) => f.topic === t).length])) as Record<Topic, number>, [withTopic]);
  const searching = query.trim().length > 0;
  const q = query.trim().toLowerCase();
  const list = searching
    ? withTopic.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
    : withTopic.filter((f) => f.topic === topic);

  const shown = searching || all ? list : list.slice(0, 4);

  if (faqs.length === 0) return <p className="mk-muted">Questions are on their way. Reach out in the Contact section below.</p>;

  return (
    <div className={css.wrap}>
      <aside className={css.side}>
        <label className={css.search}>
          <span className="sr-only" style={{ position: "absolute", left: -9999 }}>Search questions</span>
          <input type="search" placeholder="Search Questions" value={query} onChange={(e) => { setQuery(e.target.value); setOpen(null); }} />
        </label>
        <div className={css.topics} role="tablist" aria-label="Question topics">
          {TOPICS.filter((t) => counts[t] > 0).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={!searching && topic === t}
              className={css.topic}
              onClick={() => { setTopic(t); setQuery(""); setOpen(null); setAll(false); }}
            >
              <span>{t}</span>
              <span className={css.count}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className={`${css.ask} ${css.askSide}`}>
          <strong>Still Have a Question?</strong>
          <Link className="mk-btn mk-btn-primary" href="/#contact">Ask Us</Link>
        </div>
        {footer && <div className={`${css.foot} ${css.footSide}`}>{footer}</div>}
      </aside>

      <div className={css.list} role="tabpanel">
        {searching && <p className={css.found}>{list.length} {list.length === 1 ? "result" : "results"} for &ldquo;{query.trim()}&rdquo;</p>}
        {list.length === 0 && (
          <p className={css.empty}>No questions match that. <Link href="/#contact">Ask us directly.</Link></p>
        )}
        {shown.map((f, i) => {
          const id = `${uid}-${i}`;
          const isOpen = open === f.question;
          return (
            <div key={f.question} className={css.item} data-open={isOpen}>
              <h3>
                <button id={`${id}-b`} aria-expanded={isOpen} aria-controls={`${id}-p`} onClick={() => setOpen(isOpen ? null : f.question)}>
                  <span className={css.num}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={css.q}>{f.question}</span>
                  <span className={css.icon} aria-hidden="true" />
                </button>
              </h3>
              <div id={`${id}-p`} role="region" aria-labelledby={`${id}-b`} className={css.panel}>
                <div className={css.inner}>
                  <p>{f.answer}</p>
                  {searching && <small className={css.tag}>{f.topic}</small>}
                </div>
              </div>
            </div>
          );
        })}
        {!searching && !all && list.length > 4 && (
          <button type="button" className="mk-btn mk-btn-ghost" onClick={() => setAll(true)}>Show all {list.length} questions</button>
        )}
        {footer && <div className={`${css.foot} ${css.footBelow}`}>{footer}</div>}
        <div className={`${css.ask} ${css.askBelow}`}>
          <strong>Still Have a Question?</strong>
          <Link className="mk-btn mk-btn-primary" href="/#contact">Ask Us</Link>
        </div>
      </div>
    </div>
  );
}
