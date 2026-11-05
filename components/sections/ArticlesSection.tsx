import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { getNews } from "@/lib/news";
import { titleCase } from "@/lib/titlecase";
import { Reveal } from "@/components/home/Reveal";
import css from "./articles.module.css";
import sc from "./sections.module.css";

const fmt = (d: string) =>
  new Date(d.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric", timeZone: "UTC" });

// Top college story of the day as the featured card, then the next newest headlines with their photos.
// Headlines refresh daily from public news feeds. If none can be loaded, it falls back to IvyIn's own guides.
export async function ArticlesSection() {
  const { lead, rest } = await getNews(3);
  const guides = [...GUIDES].sort((a, b) => b.updated.localeCompare(a.updated));
  if (!lead && guides.length === 0) return null;

  return (
    <section id="guides" className={css.band}>
      <div className={sc.wrap}>
        <Reveal className={sc.head}>
          <div className={css.headRow}>
            <div>
              <p className={sc.eyebrow}>Resources / News</p>
              <h2 className={sc.h2}>Articles &amp; News</h2>
            </div>
            <Link href="/guides" className={css.all}>Explore All Guides</Link>
          </div>
        </Reveal>
        <div className={css.grid}>
          <Reveal>
            {lead ? (
              <a href={lead.url} target="_blank" rel="noopener noreferrer" className={css.feature}>
                {lead.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={lead.image} alt="" className={css.featImg} loading="eager" referrerPolicy="no-referrer" />}
                <span className={css.kicker}>Top College Story Today · {lead.source}</span>
                <span className={css.featTitle}>{lead.title}<span className={css.sr}> (opens in a new tab)</span></span>
                <span className={css.read}>Read at {lead.source} →</span>
              </a>
            ) : (
              <Link href={`/guides/${guides[0].slug}`} className={css.feature}>
                <span className={css.kicker}>Featured Guide</span>
                <span className={css.featTitle}>{titleCase(guides[0].title)}</span>
                <span className={css.featDesc}>{guides[0].description}</span>
                <span className={css.read}>Read the Guide →</span>
              </Link>
            )}
          </Reveal>
          <ul className={css.list}>
            {lead
              ? rest.map((n, i) => (
                  <li key={n.url}>
                    <Reveal delay={(i + 1) * 110}>
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className={css.row}>
                        <span className={css.thumb} data-n={i % 3} aria-hidden="true">
                          {n.short}
                          {n.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={n.image} alt="" className={css.thumbImg} loading="lazy" referrerPolicy="no-referrer" />}
                        </span>
                        <span>
                          <time className={css.date} dateTime={n.date}>{n.source} · {fmt(n.date)}</time>
                          <span className={css.rowTitle}>{n.title}<span className={css.sr}> (opens in a new tab)</span></span>
                        </span>
                      </a>
                    </Reveal>
                  </li>
                ))
              : guides.slice(1, 4).map((g, i) => (
                  <li key={g.slug}>
                    <Reveal delay={(i + 1) * 110}>
                      <Link href={`/guides/${g.slug}`} className={css.row}>
                        <span className={css.thumb} data-n={i % 3} aria-hidden="true">{String(i + 2).padStart(2, "0")}</span>
                        <span>
                          <time className={css.date} dateTime={g.updated}>{fmt(g.updated)}</time>
                          <span className={css.rowTitle}>{titleCase(g.title)}</span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
