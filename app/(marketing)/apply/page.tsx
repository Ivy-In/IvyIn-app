import type { Metadata } from "next";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "Apply to be a consultant | IvyIn" };

export default function Apply() {
  return (
    <>
      <section className="mk-hero">
        <div className="mk-wrap">
          <div className="mk-eyebrow">Careers</div>
          <h1>Apply to be an IvyIn consultant</h1>
          <p className="mk-lede">Tell us about yourself. It takes about ten minutes, and every question is required.</p>
        </div>
      </section>
      <section className="mk-alt">
        <div className="mk-wrap mk-narrow">
          <div className="mk-card">
            <ApplyForm />
          </div>
        </div>
      </section>
    </>
  );
}
