import Link from "next/link";
import { signUp } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const sp = await searchParams;

  if (sp.sent) {
    return (
      <main className="wrap" style={{ maxWidth: 420 }}>
        <div className="card">
          <h1>Check your email</h1>
          <p>We sent a confirmation link. Open it to finish creating your account.</p>
          <Link href="/login">Back to log in</Link>
        </div>
      </main>
    );
  }

  const messages: Record<string, string> = {
    short: "Password must be at least 10 characters.",
    mismatch: "The two passwords don't match.",
    exists: "We couldn't create that account. Try logging in instead.",
    missing: "Please fill in every field.",
  };

  return (
    <main className="wrap" style={{ maxWidth: 420 }}>
      <div className="card">
        <h1>Create your account</h1>
        {sp.error && <p className="error">{messages[sp.error] ?? "Something went wrong. Try again."}</p>}
        <form action={signUp}>
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" required autoComplete="name" />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          <label htmlFor="password">Password (10+ characters)</label>
          <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" />
          <p style={{ marginTop: 18 }}>
            <button className="btn" type="submit">Create account</button>
          </p>
        </form>
        <p className="muted">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
