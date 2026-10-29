import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Application received | IvyIn" };

export default function Thanks() {
  return (
    <section className="mk-hero">
      <div className="mk-wrap">
        <div className="mk-eyebrow">Application received</div>
        <h1>Thank you for applying to be an IvyIn consultant!</h1>
        <p className="mk-lede">We will review your application and reach out to you soon.</p>
        <p><Link className="mk-btn mk-btn-primary" href="/">Back to home</Link></p>
      </div>
    </section>
  );
}
