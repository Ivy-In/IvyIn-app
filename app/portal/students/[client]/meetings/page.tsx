import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getContext } from "@/lib/auth";
import { UUID } from "@/lib/dashboard";
import { isoToEtLocal } from "@/lib/events";
import { RECURRENCE_LABEL, RECURRENCES, meetingWhen, type MeetingRow } from "@/lib/meetings";
import { addMeeting, deleteMeeting, updateMeeting } from "./actions";

const ERRORS: Record<string, string> = {
  invalid: "Add a title and a start time.",
  save: "That could not be saved. Advisors can only add meetings that are upcoming.",
  confirm: "Tick the box to confirm the cancellation.",
  own: "Advisors can only edit their own upcoming meetings.",
};

// Shared by "New meeting" and the edit form on each meeting.
function MeetingForm({
  meeting,
  clientId,
  action,
  label,
}: {
  meeting?: MeetingRow;
  clientId?: string;
  action: (fd: FormData) => Promise<void>;
  label: string;
}) {
  const prefix = meeting ? `m-${meeting.id}` : "new";
  return (
    <form action={action}>
      {meeting && <input type="hidden" name="id" value={meeting.id} />}
      {clientId && <input type="hidden" name="client_id" value={clientId} />}

      <label htmlFor={`${prefix}-title`}>Title</label>
      <input id={`${prefix}-title`} name="title" required maxLength={200} defaultValue={meeting?.title} placeholder="Essay review with Sam" />

      <div className="grid2">
        <div>
          <label htmlFor={`${prefix}-starts`}>Starts (Eastern time)</label>
          <input
            id={`${prefix}-starts`}
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={meeting ? isoToEtLocal(meeting.starts_at) : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-ends`}>Ends (optional)</label>
          <input
            id={`${prefix}-ends`}
            name="ends_at"
            type="datetime-local"
            defaultValue={meeting?.ends_at ? isoToEtLocal(meeting.ends_at) : undefined}
          />
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor={`${prefix}-rec`}>Repeats</label>
          <select id={`${prefix}-rec`} name="recurrence" defaultValue={meeting?.recurrence ?? "none"}>
            {RECURRENCES.map((r) => (
              <option key={r} value={r}>{RECURRENCE_LABEL[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${prefix}-until`}>Last repeat (optional)</label>
          <input
            id={`${prefix}-until`}
            name="recurrence_until"
            type="date"
            defaultValue={meeting?.recurrence_until ?? undefined}
          />
        </div>
      </div>

      <label htmlFor={`${prefix}-loc`}>Location or video link (optional)</label>
      <input id={`${prefix}-loc`} name="location" maxLength={200} defaultValue={meeting?.location ?? ""} />

      <label htmlFor={`${prefix}-notes`}>Notes for the student (optional)</label>
      <textarea id={`${prefix}-notes`} name="notes" maxLength={2000} defaultValue={meeting?.notes ?? ""} />

      <p style={{ marginTop: 12 }}>
        <button className="btn" type="submit">{label}</button>
      </p>
    </form>
  );
}

export default async function StudentMeetings({
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

  const [{ data: person }, { data: rows }] = await Promise.all([
    ctx.supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", client)
      .eq("role", "user")
      .is("archived_at", null)
      .maybeSingle(),
    ctx.supabase
      .from("meetings")
      .select("id, client_id, advisor_id, title, starts_at, ends_at, location, notes, recurrence, recurrence_until")
      .eq("client_id", client)
      .order("starts_at", { ascending: true }),
  ]);
  if (!person) notFound();

  const meetings = (rows ?? []) as MeetingRow[];
  const isAdmin = ctx.role === "admin";
  const name = person.full_name ?? person.email ?? "Student";

  return (
    <>
      <p><Link href={`/portal/students/${client}`}>← Back to {name}</Link></p>
      <h1>Meetings with {name}</h1>
      <p className="muted">
        Students and their advisors are emailed when a meeting is added, changed, or cancelled.
        Advisors can add upcoming meetings and edit their own. Only admins can cancel a meeting.
      </p>

      {sp.saved && <p className="msg">Saved. The student and advisor have been emailed.</p>}
      {sp.error && <p className="error">{ERRORS[sp.error] ?? "Something went wrong."}</p>}

      <div className="card">
        <h3>New meeting</h3>
        <MeetingForm clientId={client} action={addMeeting} label="Add meeting" />
      </div>

      <h2 style={{ marginTop: 24 }}>Scheduled</h2>
      {meetings.length === 0 && <div className="card"><p className="muted">No meetings yet.</p></div>}

      {meetings.map((m) => (
        <div className="card" key={m.id}>
          <strong>{m.title}</strong>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            {meetingWhen(m)}
            {m.location ? ` · ${m.location}` : ""}
          </p>
          {m.notes && <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{m.notes}</p>}

          {(isAdmin || (m.advisor_id === ctx.user.id && new Date(m.starts_at).getTime() > Date.now())) && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--accent)" }}>Edit meeting</summary>
              <div style={{ marginTop: 12 }}>
                <MeetingForm meeting={m} action={updateMeeting} label="Save changes" />
              </div>
            </details>
          )}

          {isAdmin && (
            <>
              <form action={deleteMeeting} style={{ marginTop: 12 }}>
                <input type="hidden" name="id" value={m.id} />
                <label style={{ display: "inline", fontWeight: 400 }}>
                  <input type="checkbox" name="confirm" required style={{ width: "auto", marginRight: 8 }} />
                  Cancel this meeting
                </label>
                <button className="btn ghost" type="submit" style={{ marginLeft: 10 }}>Cancel meeting</button>
              </form>
            </>
          )}
        </div>
      ))}
    </>
  );
}
