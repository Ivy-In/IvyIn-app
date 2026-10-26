import Link from "next/link";
import { redirect } from "next/navigation";
import { getContext } from "@/lib/auth";

export default async function StudentList() {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/portal/students");
  if (!ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");

  const [{ data: clients }, { data: profiles }] = await Promise.all([
    ctx.supabase.from("profiles").select("id, full_name, email").eq("role", "user").order("full_name"),
    ctx.supabase.from("student_profiles").select("client_id, current_grade, school, gpa_unweighted"),
  ]);

  const byId = new Map((profiles ?? []).map((p) => [p.client_id, p]));

  return (
    <>
      <h1>Students</h1>
      <p className="muted">Open a student to edit their dashboard.</p>
      <div className="card">
        {(clients ?? []).length === 0 && <p className="muted">No students yet.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(clients ?? []).map((c) => {
            const p = byId.get(c.id);
            return (
              <li key={c.id} style={{ padding: "10px 0", borderTop: "1px solid #eee", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Link href={`/portal/students/${c.id}`}>{c.full_name ?? c.email ?? "Unnamed student"}</Link>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {p?.current_grade ? `Grade ${p.current_grade}` : "Grade not set"}
                    {p?.school ? ` · ${p.school}` : ""}
                    {p?.gpa_unweighted !== null && p?.gpa_unweighted !== undefined ? ` · GPA ${p.gpa_unweighted}` : ""}
                  </div>
                </div>
                <Link className="btn ghost" href={`/portal/students/${c.id}`}>Open</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
