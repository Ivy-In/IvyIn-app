import { requireAdmin } from "@/lib/admin";
import { setHandled } from "./actions";

export default async function InquiriesPage() {
  const ctx = await requireAdmin();
  const { data: rows } = await ctx.supabase
    .from("inquiries")
    .select("id, name, email, message, handled, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <h1>Inquiries</h1>
      <p className="muted">Messages from the public contact form. Only admins can see these.</p>
      {(rows ?? []).length === 0 && <div className="card"><p className="muted">No inquiries yet.</p></div>}
      {(rows ?? []).map((r) => (
        <div className="card" key={r.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <strong>{r.name}</strong>
            <span className="muted">{new Date(r.created_at).toLocaleString()}</span>
          </div>
          <p className="muted"><a href={`mailto:${r.email}`}>{r.email}</a></p>
          <p style={{ whiteSpace: "pre-wrap" }}>{r.message}</p>
          <form action={setHandled}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="handled" value={r.handled ? "false" : "true"} />
            <button className="btn ghost" type="submit">{r.handled ? "Mark as open" : "Mark as handled"}</button>
            {r.handled && <span className="badge" style={{ marginLeft: 10 }}>handled</span>}
          </form>
        </div>
      ))}
    </>
  );
}
