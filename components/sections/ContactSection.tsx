import Link from "next/link";
import { sendInquiry } from "@/app/(marketing)/contact/actions";
import { Reveal } from "@/components/home/Reveal";
import { SectionHead } from "./SectionHead";
import css from "./sections.module.css";

const ERRORS: Record<string, string> = {
  invalid: "Please enter your name, a valid email, and a message of at least 10 characters.",
  save: "That did not work. Try again in a moment.",
};

export function ContactSection({ sent, error }: { sent?: string; error?: string }) {
  return (
    <section id="contact" className={`${css.band} ${css.final} ${css.grain}`}>
      <div className={css.wrap}>
        <div className={css.contactGrid}>
          <div>
            <SectionHead eyebrow="Contact" title="Book a free intro call" lede="Send us a few details and we will reply to arrange a time." />
            <Reveal delay={120}>
              <div className={css.apply}>
                <h3>Want to be a consultant?</h3>
                <p>Opportunities are open now for students at top universities.</p>
                <Link className="mk-btn mk-btn-primary" href="/apply">Apply now</Link>
              </div>
            </Reveal>
          </div>
          <Reveal from="right">
            <div className={css.formCard}>
              {sent && <p className="mk-ok" role="status">Thanks. We received your message and will be in touch.</p>}
              {error && <p className="mk-err" role="alert">{ERRORS[error] ?? "That did not work. Try again in a moment."}</p>}
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
