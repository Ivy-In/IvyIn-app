import { STATS } from "@/lib/mentors";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";
import css from "./home.module.css";

// Stats band directly under the hero. All numbers come from lib/mentors.ts.
export function StatsAndTicker() {
  return (
    <>
      <section className={css.stats} aria-labelledby="stats-h">
        <div className={css.wrap}>
          <Reveal>
            <p className={css.eyebrow}>Our mentors</p>
            <h2 className={css.h2} id="stats-h">Students Who Just Got In, at the Schools You Want</h2>
          </Reveal>
          <div className={css.statGrid}>
            <Reveal className={css.stat} delay={0} from="left">
              <div className={css.num}><CountUp to={STATS.mentors} /></div>
              <p className={css.cap}>mentors ready to work with you</p>
            </Reveal>
            <Reveal className={css.stat} delay={120} from="left">
              <div className={css.num}><CountUp to={STATS.universities} /></div>
              <p className={css.cap}>top universities represented</p>
            </Reveal>
            <Reveal className={css.stat} delay={240} from="left">
              <div className={css.num}><CountUp to={STATS.offers} />+</div>
              <p className={css.cap}>top college admissions earned by our mentors</p>
            </Reveal>
            <Reveal className={css.stat} delay={360} from="left">
              <div className={css.num}>1:1</div>
              <p className={css.cap}>a weekly hour with the same mentor</p>
            </Reveal>
          </div>
        </div>
      </section>

    </>
  );
}
