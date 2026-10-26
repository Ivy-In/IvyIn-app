import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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

export const metadata: Metadata = { title: "Events | IvyIn" };

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  more_info_url: string | null;
  color: EventColor;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_PER_DAY = 3;

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
    .select("id, title, starts_at, ends_at, location, description, more_info_url, color")
    .gte("starts_at", from)
    .lt("starts_at", to)
    .order("starts_at", { ascending: true });
  const events = (data ?? []) as EventRow[];

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
                const dayEvents = byDay[c.key] ?? [];
                const shown = dayEvents.slice(0, MAX_CHIPS_PER_DAY);
                const hidden = dayEvents.length - shown.length;
                return (
                  <div key={c.key} className={`mk-cal-cell${c.inMonth ? "" : " out"}`} role="gridcell">
                    <span className="mk-cal-day">{c.day}</span>
                    {shown.map((e) => (
                      <a
                        key={e.id}
                        className="mk-chip"
                        href={`#e-${e.id}`}
                        title={e.title}
                        style={{ background: EVENT_COLORS[e.color].hex }}
                      >
                        {e.title}
                      </a>
                    ))}
                    {hidden > 0 && <span className="mk-more">+{hidden} more</span>}
                  </div>
                );
              })}
            </div>

            {usedColors.length > 0 && (
              <div className="mk-legend" aria-label="Color key">
                {usedColors.map((k) => (
                  <span key={k}>
                    <i className="mk-dot" style={{ background: EVENT_COLORS[k].hex }} />
                    {EVENT_COLORS[k].label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mk-card" style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: "1.5rem" }}>This month</h2>
            {inMonth.length === 0 && <p className="mk-muted">No events scheduled this month. Check back soon.</p>}
            {inMonth.map((e) => (
              <article key={e.id} id={`e-${e.id}`} className="mk-event">
                <i className="mk-dot" style={{ background: EVENT_COLORS[e.color].hex, marginTop: 8 }} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 4px" }}>{e.title}</h3>
                  <p className="mk-muted" style={{ margin: 0 }}>
                    {formatWhen(e.starts_at, e.ends_at)}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                  <details>
                    <summary>More info</summary>
                    {e.description ? (
                      <p>{e.description}</p>
                    ) : (
                      <p>Details are coming soon.</p>
                    )}
                    {e.more_info_url && (
                      e.more_info_url.startsWith("/") ? (
                        <a href={e.more_info_url}>Learn more</a>
                      ) : (
                        <a href={e.more_info_url} target="_blank" rel="noopener noreferrer">Learn more</a>
                      )
                    )}
                  </details>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
