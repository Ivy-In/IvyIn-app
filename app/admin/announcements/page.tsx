import { requireAdmin } from "@/lib/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createAnnouncement, deleteAnnouncement, setPublished } from "./actions";

export default async function AnnouncementsPage() {
  const ctx = await requireAdmin();
  const { data: rows } = await ctx.supabase
    .from("announcements")
    .select("id, title, body, published, publish_at, expires_at")
    .order("publish_at", { ascending: false })
    .limit(100);

  return (
    <>
      <h1>Announcements</h1>
      <p className="muted">Shown on the portal home page to signed-in users while live. Times are UTC.</p>

      <div className="card">
        <h3>New announcement</h3>
        <form action={createAnnouncement}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required maxLength={200} />
          <label htmlFor="body">Message</label>
          <textarea id="body" name="body" maxLength={5000} />
          <div className="grid2">
            <div>
              <label htmlFor="publish_at">Show from (UTC, optional)</label>
              <input id="publish_at" name="publish_at" type="datetime-local" />
            </div>
            <div>
              <label htmlFor="expires_at">Hide after (UTC, optional)</label>
              <input id="expires_at" name="expires_at" type="datetime-local" />
            </div>
          </div>
          <p style={{ marginTop: 12 }}>
            <label style={{ display: "inline", fontWeight: 400 }}>
              <input type="checkbox" name="published" defaultChecked style={{ width: "auto", marginRight: 8 }} />
              Published
            </label>
          </p>
          <button className="btn" type="submit">Create</button>
        </form>
      </div>

      {(rows ?? []).map((r) => (
        <div className="card" key={r.id}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <strong>{r.title}</strong>
            {r.published ? <span className="badge">published</span> : <span className="badge draft">hidden</span>}
          </div>
          {r.body && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{r.body}</p>}
          <p className="muted">From {new Date(r.publish_at).toUTCString()}{r.expires_at ? ` until ${new Date(r.expires_at).toUTCString()}` : ""}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <form action={setPublished}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="published" value={r.published ? "false" : "true"} />
              <button className="btn ghost" type="submit">{r.published ? "Hide" : "Publish"}</button>
            </form>
            <form action={deleteAnnouncement}>
              <input type="hidden" name="id" value={r.id} />
              <ConfirmButton className="btn ghost" message="Delete this announcement? It disappears from every dashboard. This cannot be undone.">Delete</ConfirmButton>
            </form>
          </div>
        </div>
      ))}
    </>
  );
}
