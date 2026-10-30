import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { occurrences, type MeetingRow, type Occurrence } from "@/lib/meetings";
import {
  EVENT_COLORS,
  etDayKey,
  formatTime,
  formatWhen,
  monthGrid,
  monthParam,
  monthTitle,
  parseMonth,
  shiftMonth,
  type EventColor,
} from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming IvyIn events and workshops for students and families preparing for college applications.",
  alternates: { canonical: "/events" },
};

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  color: EventColor;
  visibility: "public" | "private";
};

type Info = { description: string | null; more_info_url: string | null };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_PER_DAY = 3;
// Meetings use their own color, so they never look like public events.
const MEETING_HEX = "#b5562b";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;

  // Default to the current month in Eastern time, the time zone the calendar is read in.
  const [ny, nm] = etDayKey(new Date()).split("-").map(Number);
  const { year, month } = parseMonth(sp.month) ?? { year: ny, month: nm };

  // Fetch a little past each end of the month so Eastern-time edges are never cut off.
  const from = new Date(Date.UTC(year, month - 1, 1) - 2 * 86400000).toISOString();
  const to = new Date(Date.UTC(year, month, 1) + 2 * 86400000).toISOString();

  // Row-level security returns only published events to visitors.
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, starts_at, ends_at, location, color, visibility")
    .gte("starts_at", from)
    .lt("starts_at", to)
    .order("starts_at", { ascending: true });
  const events = (data ?? []) as EventRow[];

  // Details come from a database function that applies the public/private rule.
  // Visitors who are not signed in never receive the text of a private event.
  const { data: infoRows } = await supabase.rpc("event_details", {
    p_ids: events.map((e) => e.id),
  });
  const infoById = new Map<string, Info & { id: string }>(
    ((infoRows ?? []) as (Info & { id: string })[]).map((r) => [r.id, r]),
  );

  // Signed-in users also see their own meetings with their advisor, in a different color.
  const { data: authData } = await supabase.auth.getUser();
  const myOccurrences: Occurrence[] = [];
  if (authData.user) {
    const { data: mrows } = await supabase
      .from("meetings")
      .select("id, client_id, advisor_id, title, starts_at, ends_at, location, notes, recurrence, recurrence_until")
      .eq("client_id", authData.user.id)
      .lt("starts_at", to)
      .order("starts_at", { ascending: true });
    for (const m of (mrows ?? []) as MeetingRow[]) {
      myOccurrences.push(...occurrences(m, new Date(from), new Date(to)));
    }
  }
  const meetingsByDay: Record<string, Occurrence[]> = {};
  const myThisMonth: Occurrence[] = [];
  for (const occ of myOccurrences) {
    const key = etDayKey(occ.startsAt);
    if (!key.startsWith(monthParam(year, month))) continue;
    (meetingsByDay[key] ??= []).push(occ);
    myThisMonth.push(occ);
  }

  // Group by Eastern calendar day, and keep only events that fall inside the shown month.
  const prefix = monthParam(year, month);
  const byDay: Record<string, EventRow[]> = {};
  const inMonth: EventRow[] = [];
  for (const e of events) {
    const key = etDayKey(e.starts_at);
    if (!key.startsWith(prefix)) continue;
    (byDay[key] ??= []).push(e);
    inMonth.push(e);
  }

  // Legend shows only the colors used this month.
  const usedColors = Array.from(new Set(inMonth.map((e) => e.color))) as EventColor[];

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const cells = monthGrid(year, month);

  return (
    <>
      <section className="mk-hero">
        <div className="mk-wrap">
          <div className="mk-eyebrow">Events</div>
          <h1>Guest speakers, panels and info sessions</h1>
          <p className="mk-lede">Upcoming events from IvyIn. Times are Eastern (ET).</p>
        </div>
      </section>

      <section className="mk-alt">
        <div className="mk-wrap">
          <div className="mk-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <a className="mk-btn mk-btn-ghost" href={`/events?month=${monthParam(prev.year, prev.month)}`}>← Previous</a>
              <h2 style={{ margin: 0, fontSize: "1.6rem" }}>{monthTitle(year, month)}</h2>
              <a className="mk-btn mk-btn-ghost" href={`/events?month=${monthParam(next.year, next.month)}`}>Next →</a>
            </div>

            <div className="mk-cal" role="grid" aria-label={`${monthTitle(year, month)} calendar`}>
              {WEEKDAYS.map((d) => (
                <div key={d} className="mk-cal-dow" role="columnheader">{d}</div>
              ))}
              {cells.map((c) => {
                const chips = [
                  ...(meetingsByDay[c.key] ?? []).map((occ) => ({
                    key: occ.key,
                    title: occ.meeting.title,
                    href: `#m-${occ.key}`,
                    hex: MEETING_HEX,
                  })),
                  ...(byDay[c.key] ?? []).map((e) => ({
                    key: e.id,
                    title: e.title,
                    href: `#e-${e.id}`,
                    hex: EVENT_COLORS[e.color].hex,
                  })),
                ];
                const shown = chips.slice(0, MAX_CHIPS_PER_DAY);
                const hidden = chips.length - shown.length;
                return (
                  <div key={c.key} className={`mk-cal-cell${c.inMonth ? "" : " out"}`} role="gridcell">
                    <span className="mk-cal-day">{c.day}</span>
                    {shown.map((chip) => (
                      <a key={chip.key} className="mk-chip" href={chip.href} title={chip.title} style={{ background: chip.hex }}>
                        {chip.title}
                      </a>
                    ))}
                    {hidden > 0 && <span className="mk-more">+{hidden} more</span>}
                  </div>
                );
              })}
            </div>

            {(usedColors.length > 0 || myThisMonth.length > 0) && (
              <div className="mk-legend" aria-label="Color key">
                {usedColors.map((k) => (
                  <span key={k}>
                    <i className="mk-dot" style={{ background: EVENT_COLORS[k].hex }} />
                    {EVENT_COLORS[k].label}
                  </span>
                ))}
                {myThisMonth.length > 0 && (
                  <span>
                    <i className="mk-dot" style={{ background: MEETING_HEX }} />
                    My meetings
                  </span>
                )}
              </div>
            )}
          </div>

          {myThisMonth.length > 0 && (
            <div className="mk-card" style={{ marginTop: 22 }}>
              <h2 style={{ fontSize: "1.5rem" }}>Your meetings</h2>
              {myThisMonth.map((occ) => (
                <article key={occ.key} id={`m-${occ.key}`} className="mk-event">
                  <i className="mk-dot" style={{ background: MEETING_HEX, marginTop: 8 }} aria-hidden="true" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: "0 0 4px" }}>
                      {occ.meeting.title}
                      <span className="badge" style={{ marginLeft: 10 }}>With your advisor</span>
                    </h3>
                    <p className="mk-muted" style={{ margin: 0 }}>
                      {formatWhen(occ.startsAt, occ.endsAt)}
                      {occ.meeting.location ? ` · ${occ.meeting.location}` : ""}
                    </p>
                    {occ.meeting.notes && <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{occ.meeting.notes}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mk-card" style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: "1.5rem" }}>This month</h2>
            {inMonth.length === 0 && <p className="mk-muted">No events scheduled this month. Check back soon.</p>}
            {inMonth.map((e) => (
              <article key={e.id} id={`e-${e.id}`} className="mk-event">
                <i className="mk-dot" style={{ background: EVENT_COLORS[e.color].hex, marginTop: 8 }} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 4px" }}>
                    {e.title}
                    {e.visibility === "private" && <span className="badge" style={{ marginLeft: 10 }}>Members</span>}
                  </h3>
                  <p className="mk-muted" style={{ margin: 0 }}>
                    {formatWhen(e.starts_at, e.ends_at)}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                  {(() => {
                    const info = infoById.get(e.id);
                    if (!info) {
                      // Private event, visitor not signed in: a blurred placeholder. No real text was sent.
                      return (
                        <div className="mk-locked">
                          <div className="mk-locked-blur" aria-hidden="true">
                            Speaker background, agenda and event details for IvyIn members.
                          </div>
                          <p className="mk-locked-note">
                            Members only. <Link href="/login?next=/events">Log in</Link> to see more info.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <details>
                        <summary>More info</summary>
                        {info.description ? <p>{info.description}</p> : <p>Details are coming soon.</p>}
                        {info.more_info_url &&
                          (info.more_info_url.startsWith("/") ? (
                            <a href={info.more_info_url}>Learn more</a>
                          ) : (
                            <a href={info.more_info_url} target="_blank" rel="noopener noreferrer">Learn more</a>
                          ))}
                      </details>
                    );
                  })()}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
