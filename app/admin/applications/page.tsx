import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const { data: rows } = await ctx.supabase
    .from("consultant_applications")
    .select("id, first_name, last_name, university, grad_year, reviewed, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <>
      <h1>Applications</h1>
      <p className="muted">People who applied to be an IvyIn consultant. Only admins can see these.</p>
      {sp.deleted && <p className="msg" role="status">Application deleted.</p>}
      {(rows ?? []).length === 0 && <div className="card"><p className="muted">No applications yet.</p></div>}
      <ul className="apps">
        {(rows ?? []).map((r) => {
          const name = `${r.first_name} ${r.last_name}`;
          return (
            <li key={r.id} className="app-row">
              <div>
                <strong>{name}</strong>{" "}
                <span className={r.reviewed ? "badge" : "badge draft"}>{r.reviewed ? "Reviewed" : "New"}</span>
                <div className="muted">
                  {r.university}, class of {r.grad_year} · applied{" "}
                  {new Date(r.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </div>
              </div>
              <Link className="btn" href={`/admin/applications/${r.id}`} aria-label={`View application from ${name}`}>
                View application
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
