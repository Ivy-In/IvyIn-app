import { requireAdmin } from "@/lib/admin";
import { setRole } from "./actions";

const ERRORS: Record<string, string> = {
  invalid: "Choose a valid role.",
  self: "You cannot remove your own admin role.",
  failed: "The change could not be saved.",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const { data: people } = await ctx.supabase
    .from("profiles")
    .select("id, full_name, email, role, admin_level, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1>Users</h1>
      <p className="muted">
        New advisors and admins sign up first, then you set their role here. Admins must also complete MFA.
      </p>
      {sp.saved && <p className="msg">Saved.</p>}
      {sp.error && <p className="error">{ERRORS[sp.error] ?? "Something went wrong."}</p>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>
          </thead>
          <tbody>
            {(people ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.full_name ?? "—"}</td>
                <td>{p.email}</td>
                <td colSpan={2}>
                  <form action={setRole} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input type="hidden" name="target" value={p.id} />
                    <select name="role" defaultValue={p.role} style={{ width: "auto" }}>
                      <option value="user">Client</option>
                      <option value="advisor">Advisor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select name="level" defaultValue={p.admin_level ?? ""} style={{ width: "auto" }}>
                      <option value="">Admin level</option>
                      <option value="super_admin">Super admin</option>
                      <option value="editor">Editor</option>
                      <option value="support">Support</option>
                    </select>
                    <button className="btn" type="submit">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
