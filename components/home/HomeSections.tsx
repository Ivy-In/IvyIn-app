import { FIELDS, SCHOOLS, STATS } from "@/lib/mentors";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";
import css from "./home.module.css";

const MAX = SCHOOLS[0]?.count ?? 1;

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <div className={css.track} aria-hidden={hidden || undefined}>
      {SCHOOLS.map((s) => (
        <span className={css.chip} key={s.school}>
          {s.school} <small>{s.count} {s.count === 1 ? "mentor" : "mentors"}</small>
        </span>
      ))}
    </div>
  );
}

// Stats band and university ticker, directly under the hero. All numbers come from lib/mentors.ts.
export function StatsAndTicker() {
  return (
    <>
      <section className={css.stats} aria-labelledby="stats-h">
        <div className={css.wrap}>
          <Reveal>
            <p className={css.eyebrow}>Our mentors</p>
            <h2 className={css.h2} id="stats-h">Students who just got in, at the schools you want</h2>
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

      <section className={css.marq} aria-label="Universities our mentors attend">
        <div className={css.row}><Track /><Track hidden /></div>
        <div className={`${css.row} ${css.alt}`}><Track hidden /><Track hidden /></div>
      </section>
    </>
  );
}

// "Where they study": a card per university and the fields mentors study. Sits inside the About section.
export function Universities() {
  return (
    <div style={{ marginTop: 72 }}>
          <Reveal>
            <p className={css.eyebrow}>Where they study</p>
            <h2 className={css.h2}>Every mentor attends a top 25 university</h2>
          </Reveal>
          <div className={css.uni}>
            {SCHOOLS.map((s, i) => (
              <Reveal key={s.school} delay={(i % 4) * 90}>
                <div className={css.uniCard}>
                  <h3 className={css.uniName}>{s.school}</h3>
                  <p className={css.uniCount}>{s.count} {s.count === 1 ? "mentor" : "mentors"}</p>
                  <div className={css.bar} aria-hidden="true">
                    <div className={css.fill} style={{ transform: `scaleX(${s.count / MAX})`, ["--delay" as string]: `${i * 60}ms` }} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <h3 className={css.eyebrow} style={{ marginTop: 56 }}>What they study</h3>
            <div className={css.fields}>
              {FIELDS.map((f) => <span className={css.field} key={f}>{f}</span>)}
            </div>
          </Reveal>
    </div>
  );
}
