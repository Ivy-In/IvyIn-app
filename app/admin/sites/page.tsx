import { requireAdmin } from "@/lib/admin";
import { provisionSite, setSiteStatus } from "./actions";

const ERRORS: Record<string, string> = {
  subdomain: "Use 3 to 40 lowercase letters, numbers and hyphens, starting with a letter.",
  taken: "That name is taken, or this student already has a site.",
  failed: "The site could not be created.",
};

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const ctx = await requireAdmin();
  const sp = await searchParams;

  const [{ data: sites }, { data: clients }] = await Promise.all([
    ctx.supabase
      .from("student_sites")
      .select("id, subdomain, status, client_id, profiles:client_id(full_name, email)")
      .order("subdomain"),
    ctx.supabase.from("profiles").select("id, full_name, email").eq("role", "user").order("full_name"),
  ]);

  const withSite = new Set((sites ?? []).map((s) => s.client_id));
  const needSite = (clients ?? []).filter((c) => !withSite.has(c.id));

  return (
    <>
      <h1>Student sites</h1>
      <p className="muted">
        Each student gets one private site at <code>ivy-in.com/site/name</code>. Only the student and staff can see it. Suspending a
        site hides it from the student immediately.
      </p>
      {sp.saved && <p className="msg" role="status">Site created.</p>}
      {sp.error && <p className="error" role="alert">{ERRORS[sp.error] ?? "That did not work. Try again in a moment."}</p>}

      <div className="card">
        <h3>Create a site</h3>
        {needSite.length === 0 ? (
          <p className="muted">Every client already has a site.</p>
        ) : (
          <form action={provisionSite} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label htmlFor="client_id">Client</label>
              <select id="client_id" name="client_id" required>
                {needSite.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name ?? c.email}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <label htmlFor="subdomain">Subdomain</label>
              <input id="subdomain" name="subdomain" required pattern="[a-zA-Z][a-zA-Z0-9-]{2,39}" />
            </div>
            <button className="btn" type="submit">Create site</button>
          </form>
        )}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Site</th><th>Client</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {(sites ?? []).map((s) => {
              const owner = s.profiles as unknown as { full_name: string | null; email: string | null } | null;
              return (
                <tr key={s.id}>
                  <td>/site/{s.subdomain}</td>
                  <td>{owner?.full_name ?? owner?.email ?? "—"}</td>
                  <td><span className={`badge ${s.status === "active" ? "" : "draft"}`}>{s.status}</span></td>
                  <td>
                    <form action={setSiteStatus}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="status" value={s.status === "active" ? "suspended" : "active"} />
                      <button className="btn ghost" type="submit">{s.status === "active" ? "Suspend" : "Activate"}</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
