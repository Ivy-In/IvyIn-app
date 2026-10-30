import type { Metadata } from "next";
import { sendInquiry } from "./actions";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a free intro call with IvyIn. Send us a few details and we will reply to arrange a time.",
  alternates: { canonical: "/contact" },
};

const ERRORS: Record<string, string> = {
  invalid: "Please enter your name, a valid email, and a message of at least 10 characters.",
  save: "That did not work. Try again in a moment.",
};

export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      <section className="mk-hero">
        <div className="mk-wrap">
          <div className="mk-eyebrow">Contact</div>
          <h1>Book a free intro call</h1>
          <p className="mk-lede">Send us a few details and we will reply to arrange a time.</p>
        </div>
      </section>
      <section className="mk-alt">
        <div className="mk-wrap mk-narrow">
          <div className="mk-card">
            {sp.sent && <p className="mk-ok" role="status">Thanks. We received your message and will be in touch.</p>}
            {sp.error && <p className="mk-err" role="alert">{ERRORS[sp.error] ?? "That did not work. Try again in a moment."}</p>}
            <form action={sendInquiry} className="mk-form">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" required maxLength={120} autoComplete="name" />
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" />
              <label htmlFor="message">What would you like help with?</label>
              <textarea id="message" name="message" required minLength={10} maxLength={2000} />
              <div className="mk-hp" aria-hidden="true">
                <label htmlFor="website">Leave this empty</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <p><button className="mk-btn mk-btn-primary" type="submit">Send</button></p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
