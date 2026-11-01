import { requireAdmin } from "@/lib/admin";
import { GB, PLAN_BYTES, levelFor } from "@/lib/storage";
import { KIND_LABEL, type ActivityKind } from "@/lib/activity";

const DAY = 86_400_000;
const KINDS: ActivityKind[] = ["signup", "inquiry", "application", "message", "file"];

export default async function Dashboard() {
  const ctx = await requireAdmin();
  const s = ctx.supabase;

  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const [clients, unhandled, files, usage, queued, sites, recent, unreviewed] = await Promise.all([
    s.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    s.from("inquiries").select("id", { count: "exact", head: true }).eq("handled", false),
    s.from("files").select("id", { count: "exact", head: true }),
    s.rpc("storage_usage_bytes"),
    s.from("storage_deletions").select("id", { count: "exact", head: true }).is("processed_at", null),
    s.from("student_sites").select("id", { count: "exact", head: true }),
    s.from("activity").select("kind, created_at").gte("created_at", since).limit(5000),
    s.from("consultant_applications").select("id", { count: "exact", head: true }).eq("reviewed", false),
  ]);

  // Count each kind over the last 7 and 30 days, and bucket all activity by day for the chart.
  const now = Date.now();
  const stats = Object.fromEntries(KINDS.map((k) => [k, { d7: 0, d30: 0 }])) as Record<ActivityKind, { d7: number; d30: number }>;
  const daily = new Array(14).fill(0) as number[];
  for (const r of recent.data ?? []) {
    const age = now - new Date(r.created_at).getTime();
    const kind = r.kind as ActivityKind;
    if (!stats[kind]) continue;
    stats[kind].d30 += 1;
    if (age < 7 * DAY) stats[kind].d7 += 1;
    if (age < 14 * DAY) daily[13 - Math.floor(age / DAY)] += 1;
  }
  const peak = Math.max(1, ...daily);

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

      <div className="grid2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {KINDS.map((k) => (
          <div className="card" key={k}>
            <p className="muted" style={{ margin: 0 }}>{KIND_LABEL[k]}s, last 7 days</p>
            <p style={{ fontSize: 34, fontWeight: 600, margin: "6px 0" }}>{stats[k].d7}</p>
            <p className="muted" style={{ margin: 0 }}>{stats[k].d30} in 30 days</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Activity, last 14 days</h3>
        <div role="img" aria-label={`Activity per day over the last 14 days: ${daily.join(", ")}`} style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
          {daily.map((n, i) => (
            <div key={i} title={`${n} on ${new Date(now - (13 - i) * DAY).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`} style={{ flex: 1, height: `${Math.max(4, (n / peak) * 100)}%`, background: n ? "var(--lime, #e8f2a8)" : "rgba(255,255,255,.18)" }} />
          ))}
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          {(unreviewed.count ?? 0)} consultant {unreviewed.count === 1 ? "application" : "applications"} waiting for review.
        </p>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Storage</h3>
          <p className="muted">{(bytes / GB).toFixed(2)} GB of 50 GB ({files.count ?? 0} files)</p>
          <div style={{ background: "rgba(0,0,0,.28)", borderRadius: 0, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, background: level === "ok" ? "var(--lime, #e8f2a8)" : "#c9824a", height: "100%" }} />
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
