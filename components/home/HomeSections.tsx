import { STATS } from "@/lib/mentors";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";
import { Words } from "./Words";
import { LogoWall } from "./LogoWall";
import css from "./home.module.css";

// Stats band directly under the hero. All numbers come from lib/mentors.ts.
export function StatsAndTicker() {
  return (
    <>
      <section className={css.stats} aria-labelledby="stats-h" data-wipe="">
        <div className={css.wrap}>
          <Reveal>
            <p className={css.eyebrow}>Our mentors</p>
            <h2 className={css.h2} id="stats-h"><Words text="Mentors Who Just Got In" /></h2>
          </Reveal>
          <div className={css.statGrid}>
            <Reveal className={css.stat} delay={0} from="left">
              <div className={css.num}><CountUp to={STATS.mentors} /></div>
              <p className={css.cap}>mentors</p>
            </Reveal>
            <Reveal className={css.stat} delay={120} from="left">
              <div className={css.num}><CountUp to={STATS.universities} /></div>
              <p className={css.cap}>universities</p>
            </Reveal>
            <Reveal className={css.stat} delay={240} from="left">
              <div className={css.num}><CountUp to={STATS.offers} />+</div>
              <p className={css.cap}>top college offers</p>
            </Reveal>
            <Reveal className={css.stat} delay={360} from="left">
              <div className={css.num}>1:1</div>
              <p className={css.cap}>weekly hour, same mentor</p>
            </Reveal>
          </div>
        </div>
      </section>
      <LogoWall />
    </>
  );
}
