import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import css from "./sprint.module.css";

// A limited-time offer. The terms are written here, so change them in this file.
const PRICE = "$499";
const POINTS: { n: string; head: string; body: string }[] = [
  { n: "01", head: "Edits every 3 days", body: "Essay and supplemental feedback, again and again." },
  { n: "02", head: "A call every week", body: "Guaranteed. Pick a founder or a consultant, subject to their availability." },
  { n: "03", head: "50% back if you get in", body: "Admitted ED or REA? We refund half of what you paid." },
];

export function SprintDeal() {
  return (
    <Reveal from="tilt">
      <div className={css.deal} data-glow="">
        <div className={css.main}>
          <p className={css.tag}>Special deal</p>
          <h3 className={css.name}>December Sprint</h3>
          <p className={css.price}>
            <b>{PRICE}</b>
            <span>4 weeks<br />Dec 1 to Jan 1</span>
          </p>
          <Link className="mk-btn mk-btn-ghost" href="/#contact">Claim the sprint</Link>
        </div>
        <ol className={css.points}>
          {POINTS.map((p) => (
            <li key={p.n}>
              <span className={css.n}>{p.n}</span>
              <strong>{p.head}</strong>
              <span className={css.body}>{p.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
