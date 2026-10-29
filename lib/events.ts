// Shared helpers for the events calendar. Admins enter and read times in Eastern time,
// and the database stores them in UTC.

export const EVENT_COLORS = {
  sage: { label: "Sage", hex: "#3f7a5e" },
  teal: { label: "Teal", hex: "#2f6f73" },
  amber: { label: "Amber", hex: "#8a5a00" },
  plum: { label: "Plum", hex: "#6b3f6e" },
  slate: { label: "Slate", hex: "#4a5a66" },
} as const;

export type EventColor = keyof typeof EVENT_COLORS;

export function isEventColor(v: string): v is EventColor {
  return Object.hasOwn(EVENT_COLORS, v);
}

// Only same-site paths and https links, so "More info" links can't run scripts.
export function safeLink(v: string): string | null {
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("https://")) return v;
  return null;
}

const TZ = "America/New_York";

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
});

// The Eastern wall-clock time for an instant, read as if it were UTC.
function wallClockAsUtc(ms: number): number {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
}

// "YYYY-MM-DDTHH:mm" entered in Eastern time -> ISO UTC string. Null if the value is not a valid time.
export function etToIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  // Work out the offset twice so the daylight-saving switch is handled correctly.
  let t = wall - (wallClockAsUtc(wall) - wall);
  t = wall - (wallClockAsUtc(t) - t);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

// Stored UTC time -> value for a datetime-local input, in Eastern time.
export function isoToEtLocal(iso: string): string {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

// Calendar day in Eastern time, as "YYYY-MM-DD".
export function etDayKey(iso: string | Date): string {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export function formatWhen(startIso: string, endIso?: string | null): string {
  const s = new Date(startIso);
  const range = endIso ? ` to ${timeFmt.format(new Date(endIso))}` : "";
  return `${dateFmt.format(s)}, ${timeFmt.format(s)}${range} ET`;
}

// "?month=YYYY-MM" -> year and month (1-12), or null if the value is not valid.
export function parseMonth(v: string | undefined): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(v ?? "");
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function monthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

export function monthTitle(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

// Six weeks of cells starting on the Sunday on or before the 1st. Calendar math only, so no time zone issues.
export function monthGrid(year: number, month: number): { key: string; day: number; inMonth: boolean }[] {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(year, month - 1, 1 + i - firstDow));
    cells.push({
      key: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month - 1,
    });
  }
  return cells;
}
