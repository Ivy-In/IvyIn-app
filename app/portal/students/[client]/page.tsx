import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getContext } from "@/lib/auth";
import { CATEGORIES, UUID, loadDashboard } from "@/lib/dashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { addGoal, addItem, deleteGoal, deleteItem, saveProfile } from "@/app/portal/dashboard/actions";

const ERRORS: Record<string, string> = {
  invalid: "Check the values: grade 6 to 13, GPA 0 to 4.5 (unweighted) or 0 to 6 (weighted), SAT 400 to 1600, ACT 1 to 36.",
  save: "That could not be saved. Try again.",
};
const SAVED: Record<string, string> = {
  profile: "Profile saved.",
  goal: "Target school added.",
  item: "Item added.",
};

export default async function StudentDashboardEditor({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { client } = await params;
  if (!UUID.test(client)) notFound();

  const ctx = await getContext();
  if (!ctx || !ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");
  const sp = await searchParams;

  const [{ data: person }, data] = await Promise.all([
    ctx.supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", client)
      .eq("role", "user")
      .is("archived_at", null)
      .maybeSingle(),
    loadDashboard(ctx.supabase, client),
  ]);
  if (!person) notFound();

  const p = data.profile;
  const back = `/portal/students/${client}`;
  const name = person.full_name ?? person.email ?? "Student";

  return (
    <>
      <p className="muted" style={{ marginBottom: 4 }}>
        <Link href="/portal/students">← All students</Link>
      </p>
      <h1>{name}</h1>
      <p className="muted">Edit this dashboard. The student sees the same layout and can tick their own items.</p>
      {sp.saved && <p className="msg">{SAVED[sp.saved] ?? "Saved."}</p>}
      {sp.error && <p className="error">{ERRORS[sp.error] ?? "Something went wrong."}</p>}

      <div className="grid2">
        <div className="card">
          <h3>Profile</h3>
          <form action={saveProfile}>
            <input type="hidden" name="client_id" value={client} />
            <label htmlFor="current_grade">Current grade (6–13)</label>
            <input id="current_grade" name="current_grade" inputMode="numeric" defaultValue={p?.current_grade ?? ""} />
            <label htmlFor="school">Current school</label>
            <input id="school" name="school" maxLength={120} defaultValue={p?.school ?? ""} />
            <label htmlFor="gpa_unweighted">GPA unweighted (0–4.5)</label>
            <input id="gpa_unweighted" name="gpa_unweighted" inputMode="decimal" defaultValue={p?.gpa_unweighted ?? ""} />
            <label htmlFor="gpa_weighted">GPA weighted (0–6)</label>
            <input id="gpa_weighted" name="gpa_weighted" inputMode="decimal" defaultValue={p?.gpa_weighted ?? ""} />
            <label htmlFor="sat_total">SAT total (400–1600)</label>
            <input id="sat_total" name="sat_total" inputMode="numeric" defaultValue={p?.sat_total ?? ""} />
            <label htmlFor="act_composite">ACT composite (1–36)</label>
            <input id="act_composite" name="act_composite" inputMode="numeric" defaultValue={p?.act_composite ?? ""} />
            <p className="muted" style={{ fontSize: 13 }}>Leave a field empty to clear it.</p>
            <button className="btn" type="submit">Save profile</button>
          </form>
        </div>

        <div className="card">
          <h3>Target schools</h3>
          {data.goals.length === 0 && <p className="muted">None yet.</p>}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {data.goals.map((g) => (
              <li key={g.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderTop: "1px solid #eee" }}>
                <span style={{ flex: 1 }}>
                  {g.school}
                  {g.program && <span className="muted"> · {g.program}</span>}
                </span>
                <form action={deleteGoal}>
                  <input type="hidden" name="client_id" value={client} />
                  <input type="hidden" name="id" value={g.id} />
                  <button className="btn ghost" type="submit">Remove</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={addGoal} style={{ marginTop: 12 }}>
            <input type="hidden" name="client_id" value={client} />
            <label htmlFor="school_new">School</label>
            <input id="school_new" name="school" required maxLength={120} />
            <label htmlFor="program_new">Program (optional)</label>
            <input id="program_new" name="program" maxLength={120} />
            <button className="btn" type="submit">Add target</button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Add an item</h3>
        <form action={addItem} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <input type="hidden" name="client_id" value={client} />
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" required defaultValue="academics">
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required maxLength={200} />
          </div>
          <div>
            <label htmlFor="due_on">Due date (optional)</label>
            <input id="due_on" name="due_on" type="date" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="detail">Detail (optional)</label>
            <textarea id="detail" name="detail" rows={2} maxLength={2000} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn" type="submit">Add item</button>
          </div>
        </form>
      </div>

      <h2 style={{ marginTop: 24 }}>Items</h2>
      <div className="grid2">
        {CATEGORIES.map((cat) => {
          const items = data.items.filter((i) => i.category === cat.key);
          return (
            <div className="card" key={cat.key}>
              <h3>{cat.label}</h3>
              {items.length === 0 && <p className="muted">Nothing here yet.</p>}
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item) => (
                  <li key={item.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderTop: "1px solid #eee" }}>
                    <div style={{ flex: 1, minWidth: 0, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.6 : 1 }}>
                      {item.title}
                      {item.due_on && <div className="muted" style={{ fontSize: 13 }}>Due {item.due_on}</div>}
                    </div>
                    <form action={deleteItem}>
                      <input type="hidden" name="client_id" value={client} />
                      <input type="hidden" name="id" value={item.id} />
                      <button className="btn ghost" type="submit">Remove</button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <h2 style={{ marginTop: 24 }}>What the student sees</h2>
      <StudentDashboard data={data} clientId={client} canToggle={true} backPath={back} />
    </>
  );
}
