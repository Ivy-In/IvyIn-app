// Meetings between a student and their advisor. A recurring meeting is stored once and
// expanded into dates when it is shown. Times are Eastern (ET), same as the events calendar.
import { etToIso, formatWhen, isoToEtLocal } from "@/lib/events";

export const RECURRENCES = ["none", "weekly", "biweekly", "monthly"] as const;
export type Recurrence = (typeof RECURRENCES)[number];

export function isRecurrence(v: string): v is Recurrence {
  return (RECURRENCES as readonly string[]).includes(v);
}

export type MeetingRow = {
  id: string;
  client_id: string;
  advisor_id: string | null;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  notes: string | null;
  recurrence: Recurrence;
  recurrence_until: string | null;
};

export type Occurrence = {
  key: string;
  meeting: MeetingRow;
  startsAt: string;
  endsAt: string | null;
};

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: "One time",
  weekly: "Every week",
  biweekly: "Every two weeks",
  monthly: "Every month",
};

const pad = (n: number) => String(n).padStart(2, "0");

// Eastern wall-clock parts of an ISO time.
function localParts(iso: string) {
  const [date, time] = isoToEtLocal(iso).split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return { y, mo, d, h, mi };
}

function toLocal(d: Date, h: number, mi: number): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(h)}:${pad(mi)}`;
}

// Every time a meeting happens that overlaps the window [from, to].
// Capped at 1000 repeats so a bad rule can't loop forever.
export function occurrences(m: MeetingRow, from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = [];
  const startMs = new Date(m.starts_at).getTime();
  const durationMs = m.ends_at ? new Date(m.ends_at).getTime() - startMs : null;
  const untilMs = m.recurrence_until
    ? new Date(etToIso(`${m.recurrence_until}T23:59`) ?? 0).getTime()
    : null;
  const base = localParts(m.starts_at);

  for (let k = 0; k < 1000; k++) {
    let local: string;
    if (m.recurrence === "none") {
      if (k > 0) break;
      local = isoToEtLocal(m.starts_at);
    } else if (m.recurrence === "monthly") {
      // Same day each month. Months without that day (like Feb 31) are skipped.
      const d = new Date(Date.UTC(base.y, base.mo - 1 + k, base.d));
      if (d.getUTCDate() !== base.d) continue;
      local = toLocal(d, base.h, base.mi);
    } else {
      const days = m.recurrence === "weekly" ? 7 * k : 14 * k;
      const d = new Date(Date.UTC(base.y, base.mo - 1, base.d + days));
      local = toLocal(d, base.h, base.mi);
    }

    const iso = etToIso(local);
    if (!iso) break;
    const start = new Date(iso).getTime();
    if (start > to.getTime()) break;
    if (untilMs !== null && start > untilMs) break;

    const end = durationMs === null ? null : start + durationMs;
    const reachesWindow = (end ?? start) >= from.getTime();
    if (reachesWindow) {
      out.push({
        key: `${m.id}:${iso}`,
        meeting: m,
        startsAt: iso,
        endsAt: end === null ? null : new Date(end).toISOString(),
      });
    }
  }
  return out;
}

// Plain-language time for a meeting, used in lists and emails.
export function meetingWhen(m: Pick<MeetingRow, "starts_at" | "ends_at" | "recurrence" | "recurrence_until">): string {
  const until = m.recurrence_until ? `, until ${m.recurrence_until}` : "";
  const repeat = m.recurrence === "none" ? "" : ` (${RECURRENCE_LABEL[m.recurrence].toLowerCase()}${until})`;
  return `${formatWhen(m.starts_at, m.ends_at)}${repeat}`;
}

export function meetingEmail(
  kind: "scheduled" | "updated" | "cancelled",
  m: Pick<MeetingRow, "title" | "starts_at" | "ends_at" | "location" | "notes" | "recurrence" | "recurrence_until">,
): { subject: string; text: string } {
  const verb = kind === "scheduled" ? "scheduled" : kind === "updated" ? "updated" : "cancelled";
  const lines = [
    `Your meeting "${m.title}" has been ${verb}.`,
    "",
    `When: ${meetingWhen(m)}`,
  ];
  if (m.location) lines.push(`Where: ${m.location}`);
  if (m.notes && kind !== "cancelled") lines.push("", `Notes: ${m.notes}`);
  lines.push(
    "",
    "See your upcoming meetings on your IvyIn dashboard, under the Upcoming tab.",
    "",
    "IvyIn",
  );
  return {
    subject: `Meeting ${verb}: ${m.title}`,
    text: lines.join("\n"),
  };
}
