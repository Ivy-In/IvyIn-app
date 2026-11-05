import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { getNews } from "@/lib/news";
import { titleCase } from "@/lib/titlecase";
import { Reveal } from "@/components/home/Reveal";
import css from "./articles.module.css";

const fmt = (d: string) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric", timeZone: "UTC" });

// Featured IvyIn guide on the left, the latest college headlines from the press on the right (refreshed daily).
// If no headlines can be loaded, the list falls back to the other guides.
export async function ArticlesSection() {
  const [lead, ...rest] = [...GUIDES].sort((a, b) => b.updated.localeCompare(a.updated));
  if (!lead) return null;
  const news = await getNews(3);
  return (
    <section id="guides" className={css.band}>
      <div className={css.wrap}>
        <Reveal>
          <div className={css.head}>
            <h2 className={css.h2}>Articles &amp; News</h2>
            <Link href="/guides" className={css.all}>Explore All Guides</Link>
          </div>
        </Reveal>
        <div className={css.grid}>
          <Reveal>
            <Link href={`/guides/${lead.slug}`} className={css.feature}>
              <span className={css.kicker}>Featured Guide</span>
              <span className={css.featTitle}>{titleCase(lead.title)}</span>
              <span className={css.featDesc}>{lead.description}</span>
              <span className={css.read}>Read the Guide →</span>
            </Link>
          </Reveal>
          <ul className={css.list}>
            {news.length > 0
              ? news.map((n, i) => (
                  <li key={n.url}>
                    <Reveal delay={(i + 1) * 110}>
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className={css.row}>
                        <span className={css.thumb} data-n={i % 3} aria-hidden="true">{n.short}</span>
                        <span>
                          <time className={css.date} dateTime={n.date}>{n.source} · {fmt(n.date.slice(0, 10))}</time>
                          <span className={css.rowTitle}>{n.title}<span className={css.sr}> (opens in a new tab)</span></span>
                        </span>
                      </a>
                    </Reveal>
                  </li>
                ))
              : rest.slice(0, 3).map((g, i) => (
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
