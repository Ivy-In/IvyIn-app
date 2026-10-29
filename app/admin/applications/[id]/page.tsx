import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { LONG_QUESTIONS } from "@/lib/apply";
import { deleteApplication, setReviewed } from "../actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApplicationDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const { data: a } = await ctx.supabase.from("consultant_applications").select("*").eq("id", id).maybeSingle();
  if (!a) notFound();

  const Q = ({ q, children }: { q: string; children: React.ReactNode }) => (
    <>
      <dt>{q}</dt>
      <dd>{children}</dd>
    </>
  );

  return (
    <>
      <p><Link href="/admin/applications">← All applications</Link></p>
      <h1>{a.first_name} {a.last_name}</h1>
      <p className="muted">
        Applied {new Date(a.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}{" "}
        <span className={a.reviewed ? "badge" : "badge draft"}>{a.reviewed ? "Reviewed" : "New"}</span>
      </p>
      {sp.error === "confirm" && <p className="error" role="alert">Tick the box to confirm before deleting.</p>}

      <div className="app-detail">
        <dl style={{ margin: 0 }}>
          <Q q="First name">{a.first_name}</Q>
          <Q q="Last name">{a.last_name}</Q>
          <Q q="Phone number"><a href={`tel:${a.phone}`}>{a.phone}</a></Q>
          <Q q="Email"><a href={`mailto:${a.email}`}>{a.email}</a></Q>
          <Q q="University name">{a.university}</Q>
          <Q q="Graduation year">{a.grad_year}</Q>
          <Q q="Major(s) and minor(s)">{a.major_minor}</Q>
          <Q q="Hometown">{a.hometown}</Q>
          <Q q={`${LONG_QUESTIONS.experience.label} ${LONG_QUESTIONS.experience.hint}`}>{a.experience}</Q>
          <Q q={LONG_QUESTIONS.why_accepted.label}>{a.why_accepted}</Q>
          <Q q={LONG_QUESTIONS.action_plan.label}>{a.action_plan}</Q>
          <Q q="Expected pay per hour as a consultant">{a.expected_pay}</Q>
          <Q q="Hours per week they can dedicate to IvyIn">{a.weekly_hours}</Q>
        </dl>

        <div className="app-actions">
          <form action={setReviewed}>
            <input type="hidden" name="id" value={a.id} />
            <input type="hidden" name="reviewed" value={a.reviewed ? "false" : "true"} />
            <button className="btn" type="submit">{a.reviewed ? "Mark as new" : "Mark as reviewed"}</button>
          </form>
          <form action={deleteApplication} className="confirm-row">
            <input type="hidden" name="id" value={a.id} />
            <label className="person-confirm">
              <input type="checkbox" name="confirm" value="yes" required /> Confirm
            </label>
            <button className="btn ghost" type="submit">Delete application</button>
          </form>
        </div>
      </div>
    </>
  );
}
