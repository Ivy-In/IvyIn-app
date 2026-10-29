"use client";

import { useActionState, useState } from "react";
import { submitApplication, type ApplyState } from "./actions";
import { GRAD_YEARS, LONG_QUESTIONS, countWords, type LongKey } from "@/lib/apply";

function Long({ name, initial }: { name: LongKey; initial: string }) {
  const q = LONG_QUESTIONS[name];
  const [text, setText] = useState(initial);
  const words = countWords(text);
  const over = words > q.max;
  return (
    <>
      <label htmlFor={name}>{q.label} <span className="mk-req">({q.max} words max)</span></label>
      {q.hint && <p className="mk-hint" id={`${name}-hint`}>{q.hint}</p>}
      <textarea
        id={name}
        name={name}
        required
        rows={7}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-describedby={`${name}-count${q.hint ? ` ${name}-hint` : ""}`}
        aria-invalid={over}
      />
      <p id={`${name}-count`} className={over ? "mk-count over" : "mk-count"}>
        {words} / {q.max} words{over ? `: ${words - q.max} over the limit` : ""}
      </p>
    </>
  );
}

export function ApplyForm() {
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitApplication, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="mk-form">
      {state.error && <p className="mk-err" role="alert">{state.error}</p>}

      <div className="mk-two">
        <div>
          <label htmlFor="first_name">First Name</label>
          <input id="first_name" name="first_name" required maxLength={80} autoComplete="given-name" defaultValue={v.first_name} />
        </div>
        <div>
          <label htmlFor="last_name">Last Name</label>
          <input id="last_name" name="last_name" required maxLength={80} autoComplete="family-name" defaultValue={v.last_name} />
        </div>
      </div>

      <div className="mk-two">
        <div>
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="(555) 123-4567" defaultValue={v.phone} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="name@example.com" defaultValue={v.email} />
        </div>
      </div>

      <div className="mk-two">
        <div>
          <label htmlFor="university">University Name</label>
          <input id="university" name="university" required maxLength={150} defaultValue={v.university} />
        </div>
        <div>
          <label htmlFor="grad_year">Graduation Year</label>
          <select id="grad_year" name="grad_year" required defaultValue={v.grad_year ?? ""}>
            <option value="" disabled>Select a year</option>
            {GRAD_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <label htmlFor="major_minor">Major(s) and Minor(s)</label>
      <input id="major_minor" name="major_minor" required maxLength={200} placeholder="Economics major, Spanish minor, etc." defaultValue={v.major_minor} />

      <label htmlFor="hometown">Hometown</label>
      <input id="hometown" name="hometown" required maxLength={120} placeholder="Vancouver, Canada or Los Angeles, California, etc." defaultValue={v.hometown} />

      <Long name="experience" initial={v.experience ?? ""} />
      <Long name="why_accepted" initial={v.why_accepted ?? ""} />
      <Long name="action_plan" initial={v.action_plan ?? ""} />

      <div className="mk-two">
        <div>
          <label htmlFor="expected_pay">What is your expected pay per hour as a consultant?</label>
          <input id="expected_pay" name="expected_pay" required maxLength={100} placeholder="$25" defaultValue={v.expected_pay} />
        </div>
        <div>
          <label htmlFor="weekly_hours">How many hours can you dedicate to IvyIn each week?</label>
          <input id="weekly_hours" name="weekly_hours" type="number" inputMode="numeric" min={1} max={80} step={1} required aria-describedby="hours-hint" defaultValue={v.weekly_hours} />
        </div>
      </div>
      <p className="mk-hint" id="hours-hint">Each student you take on is at least a one hour per week commitment.</p>

      <div className="mk-hp" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p><button className="mk-btn mk-btn-primary" type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit application"}</button></p>
    </form>
  );
}
