import { requireAdmin } from "@/lib/admin";
import { EVENT_COLORS, formatWhen, isoToEtLocal, type EventColor } from "@/lib/events";
import { createEvent, deleteEvent, setPublished, updateEvent } from "./actions";

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  more_info_url: string | null;
  color: EventColor;
  visibility: "public" | "private";
  published: boolean;
};

// Shared by "New event" and the edit form on each event.
function EventForm({ event, action }: { event?: EventRow; action: (fd: FormData) => Promise<void> }) {
  const prefix = event ? `e-${event.id}` : "new";
  return (
    <form action={action}>
      {event && <input type="hidden" name="id" value={event.id} />}
      <label htmlFor={`${prefix}-title`}>Title</label>
      <input id={`${prefix}-title`} name="title" required maxLength={200} defaultValue={event?.title} />

      <div className="grid2">
        <div>
          <label htmlFor={`${prefix}-starts`}>Starts (Eastern time)</label>
          <input
            id={`${prefix}-starts`}
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={event ? isoToEtLocal(event.starts_at) : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-ends`}>Ends (optional)</label>
          <input
            id={`${prefix}-ends`}
            name="ends_at"
            type="datetime-local"
            defaultValue={event?.ends_at ? isoToEtLocal(event.ends_at) : undefined}
          />
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor={`${prefix}-location`}>Location (optional)</label>
          <input id={`${prefix}-location`} name="location" maxLength={200} defaultValue={event?.location ?? ""} />
        </div>
        <div>
          <label htmlFor={`${prefix}-color`}>Calendar color</label>
          <select id={`${prefix}-color`} name="color" defaultValue={event?.color ?? "forest"}>
            {(Object.keys(EVENT_COLORS) as EventColor[]).map((key) => (
              <option key={key} value={key}>{EVENT_COLORS[key].label}</option>
            ))}
          </select>
        </div>
      </div>

      <label htmlFor={`${prefix}-more`}>More info link (optional)</label>
      <input
        id={`${prefix}-more`}
        name="more_info_url"
        maxLength={500}
        pattern="(https://|/).*"
        placeholder="https://… or /some-page"
        defaultValue={event?.more_info_url ?? ""}
      />

      <label htmlFor={`${prefix}-vis`}>Who can see the more info</label>
      <select id={`${prefix}-vis`} name="visibility" defaultValue={event?.visibility ?? "public"}>
        <option value="public">Public: everyone can read it</option>
        <option value="private">Private: signed-in users only (visitors see it blurred)</option>
      </select>

      <label htmlFor={`${prefix}-desc`}>More info (shown on the event, optional)</label>
      <textarea id={`${prefix}-desc`} name="description" maxLength={5000} defaultValue={event?.description ?? ""} />

      <p style={{ marginTop: 12 }}>
        <label style={{ display: "inline", fontWeight: 400 }}>
          <input
            type="checkbox"
            name="published"
            defaultChecked={event ? event.published : true}
            style={{ width: "auto", marginRight: 8 }}
          />
          Published
        </label>
      </p>
      <button className="btn" type="submit">{event ? "Save changes" : "Add event"}</button>
    </form>
  );
}

export default async function EventsAdminPage() {
  const ctx = await requireAdmin();
  const { data } = await ctx.supabase
    .from("events")
    .select("id, title, starts_at, ends_at, location, description, more_info_url, color, visibility, published")
    .order("starts_at", { ascending: false })
    .limit(300);
  const rows = (data ?? []) as EventRow[];

  return (
    <>
      <h1>Events</h1>
      <p className="muted">
        Shown on the public Events page. Times are Eastern (ET). Unpublished events stay hidden from visitors.
      </p>

      <div className="card">
        <h3>New event</h3>
        <EventForm action={createEvent} />
      </div>

      {rows.length === 0 && <p className="muted">No events yet.</p>}

      {rows.map((r) => (
        <div className="card" key={r.id}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                aria-hidden="true"
                style={{ display: "inline-block", width: 14, height: 14, borderRadius: 999, background: EVENT_COLORS[r.color].hex }}
              />
              <strong>{r.title}</strong>
            </span>
            <span style={{ display: "flex", gap: 6 }}>
              <span className="badge">{r.visibility === "private" ? "members only" : "public info"}</span>
              {r.published ? <span className="badge">published</span> : <span className="badge draft">hidden</span>}
            </span>
          </div>
          <p className="muted">{formatWhen(r.starts_at, r.ends_at)}{r.location ? ` · ${r.location}` : ""}</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <form action={setPublished}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="published" value={r.published ? "false" : "true"} />
              <button className="btn ghost" type="submit">{r.published ? "Hide" : "Publish"}</button>
            </form>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={r.id} />
              <button className="btn ghost" type="submit">Delete</button>
            </form>
          </div>

          <details>
            <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--accent)" }}>Edit event</summary>
            <div style={{ marginTop: 12 }}>
              <EventForm event={r} action={updateEvent} />
            </div>
          </details>
        </div>
      ))}
    </>
  );
}
