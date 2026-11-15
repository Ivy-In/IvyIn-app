import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { CubeWave } from "@/components/reel/CubeWave";
import css from "./sprint.module.css";

// A limited-time offer, styled like the reel's "Render queue" settings panel floating over the
// cube wave. The terms are written here, so change them in this file.
const PRICE = "$499";
const POINTS: { head: string; body: string }[] = [
  { head: "Edits every 3 days", body: "Essay and supplemental feedback, again and again." },
  { head: "A call every week", body: "Guaranteed. Pick a founder or a consultant, subject to their availability." },
  { head: "50% back if you get in", body: "Admitted ED or REA? We refund half of what you paid." },
];

export function SprintDeal() {
  return (
    <div className={css.stage}>
      <CubeWave />
      <span className="rl-x tl" aria-hidden="true" /><span className="rl-x tr" aria-hidden="true" />
      <span className="rl-x bl" aria-hidden="true" /><span className="rl-x br" aria-hidden="true" />
      <Reveal from="tilt">
        <div className={css.modal}>
          <div className={css.top}>
            <span className={css.tag}>Special deal</span>
            <span className={css.when}>Dec 1 &rarr; Jan 1 &middot; 4 weeks</span>
          </div>
          <h3 className={css.name}>December Sprint</h3>
          <ul className={css.rows}>
            {POINTS.map((p) => (
              <li key={p.head}>
                <div>
                  <strong>{p.head}</strong>
                  <span>{p.body}</span>
                </div>
                <span className={css.toggle} aria-hidden="true"><i /></span>
                <span className={css.sr}>Included</span>
              </li>
            ))}
          </ul>
          <div className={css.foot}>
            <p className={css.price}><b>{PRICE}</b><span>for all 4 weeks</span></p>
            <Link className={css.go} href="/#contact">Claim the sprint</Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
