import { getTestimonials } from "@/lib/content";
import { Reveal } from "@/components/home/Reveal";
import css from "@/components/home/spotlight.module.css";
import sec from "./sections.module.css";

// Mentor and family stories written in the admin Content page. With none published, nothing is shown.
export async function Testimonials() {
  const items = await getTestimonials();
  if (items.length === 0) return null;
  return (
    <section className={`${sec.band} ${sec.flat} ${sec.grain}`} aria-labelledby="stories-h">
      <div className={sec.wrap}>
        <Reveal className={sec.head}>
          <p className={sec.eyebrow}>Stories</p>
          <h2 className={sec.h2} id="stories-h">In Their Words</h2>
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
