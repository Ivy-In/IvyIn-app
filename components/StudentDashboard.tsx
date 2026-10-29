import { CATEGORIES, GOAL_TIERS, formatDue, type DashboardData } from "@/lib/dashboard";
import { toggleItem } from "@/app/portal/dashboard/actions";

const numberOrDash = (v: number | string | null | undefined) => (v === null || v === undefined ? "—" : String(v));

// Read-only view of a student dashboard. Students tick their own items (canToggle).
// Staff see the same layout on the editor page and in the student preview.
export function StudentDashboard({
  data,
  clientId,
  canToggle,
  backPath,
}: {
  data: DashboardData;
  clientId: string;
  canToggle: boolean;
  backPath: string;
}) {
  const p = data.profile;
  const stats: [string, string][] = [
    ["Grade", numberOrDash(p?.current_grade)],
    ["School", p?.school ?? "—"],
    ["GPA (unweighted)", numberOrDash(p?.gpa_unweighted)],
    ["GPA (weighted)", numberOrDash(p?.gpa_weighted)],
    ["SAT", numberOrDash(p?.sat_total)],
    ["ACT", numberOrDash(p?.act_composite)],
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 18,
          marginBottom: 18,
        }}
      >
        {stats.map(([label, value]) => (
          <div className="card" key={label} style={{ margin: 0 }}>
            <div className="muted" style={{ fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, overflowWrap: "anywhere" }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Target schools</h3>
        {data.goals.length === 0 && <p className="muted">None added yet.</p>}
        <div className="tier-grid">
          {GOAL_TIERS.map((t) => {
            const schools = data.goals.filter((g) => g.tier === t.key);
            return (
              <div key={t.key} className="tier-col">
                <h4>{t.label}</h4>
                {schools.length === 0 && <p className="muted">None</p>}
                <ul>
                  {schools.map((g) => (
                    <li key={g.id}>
                      {g.school}
                      {g.program && <span className="muted"> · {g.program}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid2">
        {CATEGORIES.map((cat) => {
          const items = data.items.filter((i) => i.category === cat.key);
          const doneCount = items.filter((i) => i.done).length;
          return (
            <div className="card" key={cat.key}>
              <h3>
                {cat.label}{" "}
                {items.length > 0 && (
                  <span className="muted" style={{ fontSize: 14 }}>
                    {doneCount}/{items.length}
                  </span>
                )}
              </h3>
              {items.length === 0 && <p className="muted">Nothing here yet.</p>}
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item) => (
                  <li
                    key={item.id}
                    style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid var(--line)" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.6 : 1 }}>
                        {item.title}
                      </div>
                      {formatDue(item.due_on) && <div className="muted" style={{ fontSize: 13 }}>Due {formatDue(item.due_on)}</div>}
                      {item.detail && <div className="muted" style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{item.detail}</div>}
                    </div>
                    {canToggle && (
                      <form action={toggleItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="done" value={item.done ? "false" : "true"} />
                        <input type="hidden" name="client_id" value={clientId} />
                        <input type="hidden" name="back" value={backPath} />
                        <button className="btn ghost" type="submit" style={{ whiteSpace: "nowrap" }}>
                          {item.done ? "Undo" : "Done"}
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
