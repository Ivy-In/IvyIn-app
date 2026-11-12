import { LOGOS } from "@/lib/logos";
import css from "./logowall.module.css";

// Two rows of university wordmarks drifting in opposite directions. Reduced motion gets a still, wrapped grid.
export function LogoWall() {
  const half = Math.ceil(LOGOS.length / 2);
  const rows = [LOGOS.slice(0, half), LOGOS.slice(half)];
  return (
    <section className={css.wall} aria-label="Universities our mentors and students come from">
      {rows.map((row, r) => (
        <div key={r} className={css.row} data-dir={r}>
          <div className={css.track}>
            {[0, 1].map((copy) => (
              <ul key={copy} className={css.set} aria-hidden={copy === 1 ? "true" : undefined}>
                {row.map((l) => (
                  <li key={l.slug}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/logos/${l.slug}.png`} alt={copy === 0 ? l.name : ""} loading="lazy" decoding="async" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
