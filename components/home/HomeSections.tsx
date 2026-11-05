import Link from "next/link";
import { FIELDS, SCHOOLS, STATS } from "@/lib/mentors";
import { GUIDES } from "@/lib/guides";
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

// Sections shown on the home page below the editable hero. All numbers come from lib/mentors.ts.
export function HomeSections() {
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

      <section className={css.sec}>
        <div className={css.wrap}>
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
      </section>

      <section className={css.sec} style={{ paddingTop: 0 }}>
        <div className={css.wrap}>
          <Reveal>
            <p className={css.eyebrow}>How it works</p>
            <h2 className={css.h2}>One mentor. One hour. Every week.</h2>
          </Reveal>
          <div className={css.steps}>
            {[
              ["01", "Get matched", "We pair you with a current student at a top 25 university, matched to your field."],
              ["02", "Meet every week", "A one-hour one-on-one with the same mentor, so they know your story."],
              ["03", "Apply with confidence", "Essays, activities, testing and deadlines, all in one private place."],
            ].map(([n, t, b], i) => (
              <Reveal className={css.step} key={n} delay={i * 130} from="left">
                <div className={css.stepNum}>{n}</div>
                <h3 className={css.stepTitle}>{t}</h3>
                <p>{b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={css.sec} style={{ paddingTop: 0 }}>
        <div className={css.wrap}>
          <Reveal>
            <p className={css.eyebrow}>Plans</p>
            <h2 className={css.h2}>Prices posted, no surprises</h2>
          </Reveal>
          <div className={css.two}>
            <Reveal>
              <div className={css.plan}>
                <p>Six months</p>
                <div className={css.price}>$1,950</div>
                <p>Weekly one-on-one meetings with your mentor.</p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className={`${css.plan} ${css.feat}`}>
                <p>Full year</p>
                <div className={css.price}>$3,250</div>
                <p>Weekly one-on-one meetings with your mentor.</p>
              </div>
            </Reveal>
          </div>
          <div className={css.actions}>
            <Link className="mk-btn mk-btn-primary" href="/services">See services</Link>
            <Link className="mk-btn mk-btn-ghost" href="/contact">Talk to us</Link>
          </div>
        </div>
      </section>

      <section className={css.sec} style={{ paddingTop: 0 }}>
        <div className={css.wrap}>
          <Reveal>
            <p className={css.eyebrow}>Guides</p>
            <h2 className={css.h2}>Start learning today</h2>
          </Reveal>
          <div className={css.two} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {GUIDES.slice(0, 3).map((g, i) => (
              <Reveal key={g.slug} delay={i * 120}>
                <Link href={`/guides/${g.slug}`} className={css.guide}>
                  <strong>{g.title}</strong>
                  <span>{g.description}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
