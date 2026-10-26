import Link from "next/link";
import { getContext } from "@/lib/auth";
import { loadDashboard } from "@/lib/dashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { formatWhen } from "@/lib/events";
import { occurrences, type MeetingRow, type Occurrence } from "@/lib/meetings";

const DAY_MS = 86400000;
const UPCOMING_DAYS = 60;

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await getContext();
  if (!ctx) return null; // layout already redirected

  const sp = await searchParams;
  const tab = sp.tab === "upcoming" ? "upcoming" : "overview";

  // Students see their own dashboard here. Staff use the Students area instead.
  const dash = ctx.isStaff ? null : await loadDashboard(ctx.supabase, ctx.user.id);

  const { data: site } = await ctx.supabase
    .from("student_sites")
    .select("subdomain, status")
    .eq("client_id", ctx.user.id)
    .maybeSingle();

  const name = ctx.profile?.full_name ?? ctx.user.email ?? "there";

  // Live announcements only: row-level security hides hidden and expired ones.
  const { data: news } = await ctx.supabase
    .from("announcements")
    .select("id, title, body")
    .order("publish_at", { ascending: false })
    .limit(5);

  // Upcoming tab: meetings (your own, or every student you can see for staff) and public events.
  let meetings: { occ: Occurrence; clientName: string | null }[] = [];
  let events: { id: string; title: string; starts_at: string; ends_at: string | null; location: string | null }[] = [];
  if (tab === "upcoming") {
    const now = new Date();
    const horizon = new Date(now.getTime() + UPCOMING_DAYS * DAY_MS);

    const { data: mrows } = await ctx.supabase
      .from("meetings")
      .select("id, client_id, advisor_id, title, starts_at, ends_at, location, notes, recurrence, recurrence_until")
      .lt("starts_at", horizon.toISOString())
      .order("starts_at", { ascending: true })
      .limit(500);
    const rows = (mrows ?? []) as MeetingRow[];
    const occs = rows
      .flatMap((m) => occurrences(m, now, horizon))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 100);

    const names = new Map<string, string>();
    if (ctx.isStaff) {
      const ids = [...new Set(rows.map((m) => m.client_id))];
      if (ids.length > 0) {
        const { data: people } = await ctx.supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", ids);
        for (const p of people ?? []) names.set(p.id, p.full_name ?? p.email ?? "Student");
      }
    }
    meetings = occs.map((occ) => ({ occ, clientName: names.get(occ.meeting.client_id) ?? null }));

    const { data: erows } = await ctx.supabase
      .from("events")
      .select("id, title, starts_at, ends_at, location")
      .gte("starts_at", now.toISOString())
      .lt("starts_at", horizon.toISOString())
      .order("starts_at", { ascending: true })
      .limit(50);
    events = erows ?? [];
  }

  return (
    <>
      <h1>Welcome, {name}</h1>

      <nav className="tabs" aria-label="Dashboard sections">
        <Link className={`tab${tab === "overview" ? " on" : ""}`} href="/portal">Overview</Link>
        <Link className={`tab${tab === "upcoming" ? " on" : ""}`} href="/portal?tab=upcoming">Upcoming</Link>
      </nav>

      {tab === "upcoming" ? (
        <>
          <div className="card">
            <h3>Meetings</h3>
            {meetings.length === 0 && <p className="muted">No meetings in the next {UPCOMING_DAYS} days.</p>}
            {meetings.map(({ occ, clientName }) => (
              <div key={occ.key} className="up-row">
                <strong>{occ.meeting.title}</strong>
                {clientName && <span className="muted"> · {clientName}</span>}
                {occ.meeting.recurrence !== "none" && <span className="badge" style={{ marginLeft: 8 }}>repeats</span>}
                <div className="muted">
                  {formatWhen(occ.startsAt, occ.endsAt)}
                  {occ.meeting.location ? ` · ${occ.meeting.location}` : ""}
                </div>
                {!ctx.isStaff && occ.meeting.notes && (
                  <p style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{occ.meeting.notes}</p>
                )}
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Events</h3>
            {events.length === 0 && <p className="muted">No events in the next {UPCOMING_DAYS} days.</p>}
            {events.map((e) => (
              <div key={e.id} className="up-row">
                <strong>{e.title}</strong>
                <div className="muted">
                  {formatWhen(e.starts_at, e.ends_at)}
                  {e.location ? ` · ${e.location}` : ""}
                </div>
              </div>
            ))}
            <p style={{ marginTop: 12 }}>
              <Link href="/events">See the full events calendar →</Link>
            </p>
          </div>
        </>
      ) : (
        <>
          {(news ?? []).map((a) => (
            <div className="card" key={a.id}>
              <strong>{a.title}</strong>
              {a.body && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{a.body}</p>}
            </div>
          ))}
          {dash && (
            <>
              <h2>Your dashboard</h2>
              <StudentDashboard data={dash} clientId={ctx.user.id} canToggle backPath="/portal" />
            </>
          )}
          <div className="grid2">
            <div className="card">
              <h3>Messages</h3>
              <p className="muted">{ctx.isStaff ? "Conversations with clients." : "Your private thread with your advisors."}</p>
              <Link className="btn" href="/portal/messages">Open messages</Link>
            </div>
            <div className="card">
              <h3>Files</h3>
              <p className="muted">Upload documents and view files shared with you.</p>
              <Link className="btn" href="/portal/files">Open files</Link>
            </div>
          </div>
          {site && (
            <div className="card">
              <h3>Your site</h3>
              <p className="muted">
                Private to you and your advisors. <span className="badge">{site.status}</span>
              </p>
              {site.status === "active" && (
                <a className="btn ghost" href={`/site/${site.subdomain}`}>
                  Open my site
                </a>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
