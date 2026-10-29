import { requireAdmin } from "@/lib/admin";
import { purgeStudent, setArchived, setRole } from "./actions";

const ERRORS: Record<string, string> = {
  invalid: "Choose a valid role.",
  self: "You cannot change your own admin role, or archive or delete your own account.",
  last_admin: "There must always be one active admin. Make someone else an admin first.",
  failed: "The change could not be saved.",
  confirm: "Tick the box to confirm before archiving someone.",
  auth: "They were archived, but sign-in could not be blocked. Try again.",
  archive_first: "Archive this person before deleting them permanently.",
  confirm_email: "The email you typed does not match. Nothing was deleted.",
  auth_delete: "Their data was deleted, but the sign-in account could not be removed. Try again.",
};
const SAVED: Record<string, string> = {
  "1": "Saved.",
  archived: "Archived. They are hidden from staff and cannot sign in.",
  restored: "Restored. They can sign in again.",
  purged: "Permanently deleted.",
};
const ROLE_LABEL: Record<string, string> = { user: "Client", advisor: "Advisor", admin: "Admin" };

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

  const all = people ?? [];
  const active = all.filter((p) => !p.archived_at);
  const archived = all.filter((p) => p.archived_at);

  const row = (p: (typeof all)[number]) => {
    const isMe = p.id === ctx.user.id;
    const name = p.full_name || p.email || "this person";
    return (
      <li key={p.id} className={`person${p.archived_at ? " is-archived" : ""}`}>
        <div className="person-main">
          <div className="person-who">
            <strong>{p.full_name ?? "No name"}</strong>
            <span className={`badge role-${p.role}`}>{ROLE_LABEL[p.role] ?? p.role}</span>
            {isMe && <span className="badge">You</span>}
            {p.archived_at && <span className="badge draft">Archived</span>}
          </div>
          <div className="muted person-email">{p.email}</div>
        </div>

        <form action={setRole} className="person-role">
          <input type="hidden" name="target" value={p.id} />
          <select name="role" defaultValue={p.role} aria-label={`Role for ${name}`}>
            <option value="user">Client</option>
            <option value="advisor">Advisor</option>
            <option value="admin">Admin</option>
          </select>
          <select name="level" defaultValue={p.admin_level ?? ""} aria-label={`Admin level for ${name}`}>
            <option value="">Admin level</option>
            <option value="super_admin">Super Admin</option>
            <option value="editor">Editor</option>
            <option value="support">Support</option>
          </select>
          <button className="btn" type="submit">Save role</button>
        </form>

        {!isMe && !p.archived_at && (
          <form action={setArchived} className="person-actions">
            <input type="hidden" name="target" value={p.id} />
            <input type="hidden" name="archive" value="yes" />
            <label className="person-confirm">
              <input type="checkbox" name="confirm" value="yes" required />
              Confirm
            </label>
            <button className="btn ghost" type="submit">Archive {name}</button>
          </form>
        )}

        {!isMe && p.archived_at && (
          <div className="person-actions">
            <form action={setArchived}>
              <input type="hidden" name="target" value={p.id} />
              <input type="hidden" name="archive" value="no" />
              <button className="btn ghost" type="submit">Restore {name}</button>
            </form>
            <form action={purgeStudent} className="person-purge">
              <input type="hidden" name="target" value={p.id} />
              <label className="visually-hidden" htmlFor={`del-${p.id}`}>
                Type {p.email} to confirm deleting {name}
              </label>
              <input id={`del-${p.id}`} name="confirm_email" placeholder={`Type ${p.email} to confirm`} required autoComplete="off" />
              <button className="btn danger" type="submit">Delete {name} permanently</button>
              <p className="muted person-warn">
                Cannot be undone. Their messages, files, dashboard and site are removed too.
              </p>
            </form>
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      <h1>Users</h1>
      <p className="muted">
        New advisors and admins sign up first, then you set their role here. Admins must also complete MFA.
        Archive someone to hide them and block sign-in. You can restore them later or delete them for good.
      </p>
      {sp.saved && <p className="msg" role="status">{SAVED[sp.saved] ?? "Saved."}</p>}
      {sp.error && <p className="error" role="alert">{ERRORS[sp.error] ?? "That did not work. Try again in a moment."}</p>}

      <h2 className="people-h">Active <span className="muted">({active.length})</span></h2>
      <ul className="people">{active.map(row)}</ul>

      {archived.length > 0 && (
        <>
          <h2 className="people-h">Archived <span className="muted">({archived.length})</span></h2>
          <ul className="people">{archived.map(row)}</ul>
        </>
      )}
    </>
  );
}
