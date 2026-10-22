import Link from "next/link";
import { signIn } from "./actions";
import { safeNext } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next);

  return (
    <main className="wrap" style={{ maxWidth: 420 }}>
      <div className="card">
        <h1>Log in</h1>
        {sp.error && <p className="error">Email or password is incorrect.</p>}
        <form action={signIn}>
          <input type="hidden" name="next" value={next} />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
          <p style={{ marginTop: 18 }}>
            <button className="btn" type="submit">Log in</button>
          </p>
        </form>
        <p className="muted">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
