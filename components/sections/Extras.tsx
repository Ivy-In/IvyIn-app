import Link from "next/link";
import { getTestimonials } from "@/lib/content";
import { Reveal } from "@/components/home/Reveal";
import css from "@/components/home/spotlight.module.css";
import sec from "./sections.module.css";

const FEATURES = [
  ["01", "Matched to your field", "Your consultant studies what you want to study, so the advice fits your path."],
  ["02", "A weekly one-hour meeting", "One-on-one, every week, with the same consultant who knows your story."],
  ["03", "One private place", "Essays, files, messages and deadlines in your own IvyIn portal."],
  ["04", "Weekly events", "Guest speakers, panels and info sessions open to every student."],
  ["05", "Prices posted up front", "$1,950 for six months or $3,250 for a year. No surprises."],
  ["06", "Mentors who just got in", "Current students at top universities, not someone years removed."],
];

// "All in one place": what you get with IvyIn, as a grid. Sits inside the Services section.
export function Features() {
  return (
    <div className={css.feat}>
      {FEATURES.map(([n, t, b], i) => (
        <Reveal key={n} className={css.fitem} delay={(i % 3) * 110}>
          <span className={css.fnum}>{n}</span>
          <h3>{t}</h3>
          <p>{b}</p>
        </Reveal>
      ))}
    </div>
  );
}

// Mentor and family stories written in the admin Content page. With none published, nothing is shown.
export async function Testimonials() {
  const items = await getTestimonials();
  if (items.length === 0) return null;
  return (
    <section className={`${sec.band} ${sec.flat} ${sec.grain}`} aria-labelledby="stories-h">
      <div className={sec.wrap}>
        <Reveal className={sec.head}>
          <p className={sec.eyebrow}>Stories</p>
          <h2 className={sec.h2} id="stories-h">In their words</h2>
        </Reveal>
        <div className={css.rail} tabIndex={0} aria-label="Stories">
          {items.map((t, i) => (
            <figure key={i} className={css.quote} style={{ margin: 0 }}>
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption>
                <cite>{t.name}</cite>
                {t.detail && <small>{t.detail}</small>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className={css.closeBand} aria-labelledby="close-h">
      <Reveal>
        <h2 id="close-h" className={css.closeH}>Ready to meet your mentor?</h2>
        <p>Book a free intro call, or apply to join our team of mentors.</p>
        <div className={css.closeBtns}>
          <Link className="mk-btn mk-btn-primary" href="/#contact">Get started</Link>
          <Link className="mk-btn mk-btn-ghost" href="/apply">Become a consultant</Link>
        </div>
      </Reveal>
    </section>
  );
}
