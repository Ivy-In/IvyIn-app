import { requireAdmin } from "@/lib/admin";
import { GB, PLAN_BYTES, levelFor } from "@/lib/storage";

export default async function Dashboard() {
  const ctx = await requireAdmin();
  const s = ctx.supabase;

  const [clients, unhandled, files, usage, queued, sites] = await Promise.all([
    s.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    s.from("inquiries").select("id", { count: "exact", head: true }).eq("handled", false),
    s.from("files").select("id", { count: "exact", head: true }),
    s.rpc("storage_usage_bytes"),
    s.from("storage_deletions").select("id", { count: "exact", head: true }).is("processed_at", null),
    s.from("student_sites").select("id", { count: "exact", head: true }),
  ]);

  const bytes = Number(usage.data ?? 0);
  const level = levelFor(bytes);
  const pct = Math.min(100, (bytes / PLAN_BYTES) * 100);

  return (
    <>
      <h1>Dashboard</h1>

      {level !== "ok" && (
        <div className="card" style={{ borderColor: level === "critical" ? "var(--danger)" : "#c9b44a" }}>
          <strong>{level === "critical" ? "Storage is nearly full." : "Storage is getting full."}</strong>{" "}
          Using {(bytes / GB).toFixed(1)} GB of the 50 GB plan. Delete files you no longer need on the Files page.
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <h3>Storage</h3>
          <p className="muted">{(bytes / GB).toFixed(2)} GB of 50 GB ({files.count ?? 0} files)</p>
          <div style={{ background: "var(--line)", borderRadius: 999, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, background: level === "ok" ? "var(--green)" : "#c9824a", height: "100%" }} />
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            Alerts at 40 GB and 45 GB. Deleted files are removed from storage by the nightly job,
            so there may be a short delay after deletion.
          </p>
        </div>
        <div className="card">
          <h3>People</h3>
          <p className="muted">{clients.count ?? 0} clients, {sites.count ?? 0} student sites</p>
          <p className="muted">{queued.count ?? 0} deletions waiting to be processed</p>
          <p className="muted">{unhandled.count ?? 0} unhandled inquiries</p>
        </div>
      </div>
    </>
  );
}
