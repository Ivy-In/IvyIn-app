"use client";
import Link from "next/link";
import { useState } from "react";
import css from "./sections.module.css";

type Plan = { label: string; price: string; per: string };

// A switch between the six-month and the yearlong plan. Prices come from the Services content, so editing
// them in the admin Content page changes this card too.
export function PricingToggle({ title, plans, saving }: { title: string; plans: [Plan, Plan]; saving?: string }) {
  const [i, setI] = useState(0);
  const plan = plans[i];
  return (
    <div className={css.pricing}>
      <h3 className={css.cardTitle}>{title}</h3>
      <div className={css.switch} role="radiogroup" aria-label="Choose a plan">
        <span className={css.thumb} style={{ transform: `translateX(${i * 100}%)` }} aria-hidden="true" />
        {plans.map((p, k) => (
          <button key={p.label} type="button" role="radio" aria-checked={i === k} className={css.opt} onClick={() => setI(k)}>
            {p.label}
          </button>
        ))}
      </div>
      <p className={css.amount} aria-live="polite">
        <span key={i} className={css.amt}>{plan.price}</span>
        <span className={css.per}>{plan.per}</span>
      </p>
      <p className={css.save} style={{ visibility: i === 1 && saving ? "visible" : "hidden" }}>{saving ?? " "}</p>
      <Link className="mk-btn mk-btn-primary" href="/#contact">Get Started</Link>
    </div>
  );
}
