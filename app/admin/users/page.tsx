import { requireAdmin } from "@/lib/admin";
import { setArchived, setRole } from "./actions";

const ERRORS: Record<string, string> = {
  invalid: "Choose a valid role.",
  self: "You cannot remove your own admin role, or archive your own account.",
  failed: "The change could not be saved.",
  confirm: "Tick the box to confirm before archiving a student.",
  auth: "The student was archived, but sign-in could not be blocked. Try again.",
};
const SAVED: Record<string, string> = {
  "1": "Saved.",
  archived: "Student archived. They are hidden from staff and cannot sign in.",
  restored: "Student restored. They can sign in again.",
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
    .select("id, full_name, email, role, admin_level, created_at, archived_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1>Users</h1>
      <p className="muted">
        New advisors and admins sign up first, then you set their role here. Admins must also complete MFA.
      </p>
      {sp.saved && <p className="msg">{SAVED[sp.saved] ?? "Saved."}</p>}
      {sp.error && <p className="error">{ERRORS[sp.error] ?? "Something went wrong."}</p>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
          </thead>
          <tbody>
            {(people ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.full_name ?? "—"}</td>
                <td>{p.email}</td>
                <td>
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
                <td>
                  {p.role === "user" && p.archived_at && (
                    <form action={setArchived} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="badge draft">Archived</span>
                      <input type="hidden" name="target" value={p.id} />
                      <input type="hidden" name="archive" value="no" />
                      <button className="btn ghost" type="submit">Restore</button>
                    </form>
                  )}
                  {p.role === "user" && !p.archived_at && (
                    <form action={setArchived} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input type="hidden" name="target" value={p.id} />
                      <input type="hidden" name="archive" value="yes" />
                      <label style={{ display: "inline", fontWeight: 400, margin: 0 }}>
                        <input type="checkbox" name="confirm" value="yes" required style={{ width: "auto", marginRight: 4 }} />
                        Confirm
                      </label>
                      <button className="btn ghost" type="submit">Archive</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
