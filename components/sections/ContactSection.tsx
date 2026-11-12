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
        <div className={css.contactTop}>
          <SectionHead eyebrow="Contact" title="Get Started" />
          <a className={css.offer} href="/#services">
            <b>December Sprint</b>
            <span>$499 &middot; Dec 1 to Jan 1</span>
          </a>
        </div>
        <Reveal from="up">
          <div className={css.formCard}>
            {sent && <p className="mk-ok" role="status">Thanks. We received your message and will be in touch.</p>}
            {error && <p className="mk-err" role="alert">{ERRORS[error] ?? "That did not work. Try again in a moment."}</p>}
            <form action={sendInquiry} className={`mk-form ${css.formGrid}`}>
              <div>
                <label htmlFor="name">Your name</label>
                <input id="name" name="name" required maxLength={120} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" />
              </div>
              <div className={css.wide}>
                <label htmlFor="message">What would you like help with?</label>
                <textarea id="message" name="message" required minLength={10} maxLength={2000} rows={3} />
              </div>
              <div className="mk-hp" aria-hidden="true">
                <label htmlFor="website">Leave this empty</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className={css.wide}>
                <button className="mk-btn mk-btn-primary" type="submit">Send</button>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
