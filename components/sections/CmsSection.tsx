import Link from "next/link";
import { getPage, type PageContent } from "@/lib/content";
import { anchorHref } from "@/lib/anchors";
import { Reveal } from "@/components/home/Reveal";
import { SectionHead } from "./SectionHead";
import css from "./sections.module.css";

type Tone = "glow" | "deep" | "flat";

// A section whose words come from the CMS (About, How It Works, Services), so admins can still edit them.
export async function CmsSection({
  id, slug, eyebrow, tone = "flat", children,
}: { id: string; slug: string; eyebrow: string; tone?: Tone; children?: React.ReactNode }) {
  const c: PageContent = await getPage(slug);
  return (
    <section id={id} className={`${css.band} ${css[tone]} ${css.grain}`} aria-labelledby={`${id}-h`}>
      <div className={css.wrap}>
        <Reveal className={css.head}>
          <p className={css.eyebrow}>{c.eyebrow ?? eyebrow}</p>
          <h2 className={css.h2} id={`${id}-h`}>{c.headline}</h2>
          {c.lede && <p className={css.lead}>{c.lede}</p>}
        </Reveal>

        {c.sections.length > 0 && (
          <div className={css.cards}>
            {c.sections.map((s, i) => (
              <Reveal key={i} delay={i * 110} from="up">
                <div className={css.card}>
                  <h3 className={css.cardTitle}>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {(c.primary || c.secondary) && (
          <div className={css.cta}>
            {c.primary && <Link className="mk-btn mk-btn-primary" href={anchorHref(c.primary.href)}>{c.primary.label}</Link>}
            {c.secondary && <Link className="mk-btn mk-btn-ghost" href={anchorHref(c.secondary.href)}>{c.secondary.label}</Link>}
          </div>
        )}

        {children}

        {c.closing && (
          <Reveal>
            <div className={css.closing}>
              <div>
                <h3>{c.closing.headline}</h3>
                <p>{c.closing.body}</p>
              </div>
              <Link className="mk-btn mk-btn-light" href={anchorHref(c.closing.cta.href)}>{c.closing.cta.label}</Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
