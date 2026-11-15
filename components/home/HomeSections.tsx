import { MENTORS, SCHOOLS, STATS, tracksOf } from "@/lib/mentors";
import { CountUp } from "./CountUp";
import { Words } from "./Words";
import { LogoWall } from "./LogoWall";
import { InView } from "@/components/reel/InView";
import css from "./home.module.css";

// The reel's analytics frame, filled with real numbers from lib/mentors.ts: a row of big figures,
// a bar chart of mentors per school (tallest bar in ultramarine) and a donut for the share of mentors
// in business and economics. Bars grow, the donut fills and figures count up as the panel scrolls in.
const BARS = SCHOOLS.slice(0, 8);
const MAX = Math.max(...BARS.map((b) => b.count));
const BIZ = MENTORS.filter((m) => tracksOf(m.major).includes("Business and Economics")).length;
const BIZ_PCT = Math.round((BIZ / MENTORS.length) * 100);
const R = 42;
const CIRC = 2 * Math.PI * R;
const short = (s: string) => s.replace("UC Berkeley", "Berkeley").replace("UNC Chapel Hill", "UNC");

export function StatsAndTicker() {
  const top = BARS.filter((b) => b.count === MAX).map((b) => b.school);
  return (
    <>
      <section className={css.stats} aria-labelledby="stats-h">
        <div className={css.wrap}>
          <InView className={css.dash}>
            <div className={css.dashTop}>
              <span className="rl-label">Our mentors &middot; live</span>
              <span className="rl-label">IvyIn / Dashboard</span>
            </div>
            <h2 className={css.dashH} id="stats-h"><Words text="Mentors Who Just Got In" /></h2>

            <div className={css.kpis}>
              <div><span className="rl-label">Mentors</span><b><CountUp to={STATS.mentors} /></b></div>
              <div><span className="rl-label">Universities</span><b><CountUp to={STATS.universities} /></b></div>
              <div><span className="rl-label">Top college offers</span><b><CountUp to={STATS.offers} />+</b></div>
              <div><span className="rl-label">Weekly hour, same mentor</span><b>1:1</b></div>
            </div>

            <div className={css.charts}>
              <figure className={css.bars}>
                <figcaption className="rl-label">Mentors by school</figcaption>
                <div className={css.barRow} role="img" aria-label={`Mentors by school: ${BARS.map((b) => `${b.school} ${b.count}`).join(", ")}.`}>
                  {BARS.map((b, i) => (
                    <div key={b.school} className={css.bar} data-top={b.count === MAX ? "" : undefined} style={{ ["--h" as string]: `${(b.count / MAX) * 100}%`, ["--i" as string]: i }}>
                      <i><em>{b.count}</em></i>
                      <span>{short(b.school)}</span>
                    </div>
                  ))}
                </div>
                <p className={css.note}>{top.join(" and ")} lead with {MAX} mentors each.</p>
              </figure>

              <figure className={css.donut}>
                <figcaption className="rl-label">Business and economics</figcaption>
                <div className={css.ring} role="img" aria-label={`${BIZ_PCT}% of mentors study business or economics.`}>
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r={R} className={css.ringTrack} />
                    <circle cx="50" cy="50" r={R} className={css.ringFill} style={{ ["--c" as string]: CIRC, ["--o" as string]: CIRC * (1 - BIZ_PCT / 100) }} />
                  </svg>
                  <b>{BIZ_PCT}%</b>
                </div>
                <p className={css.note}>{BIZ} of {MENTORS.length} mentors study business or economics.</p>
              </figure>
            </div>
          </InView>
        </div>
      </section>
      <LogoWall />
    </>
  );
}
