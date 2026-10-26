// Emails about public calendar changes. Private event details never go in the email.
import type { createClient } from "@/lib/supabase/server";
import { formatWhen } from "@/lib/events";
import { sendEmail } from "@/lib/mail";

type Client = Awaited<ReturnType<typeof createClient>>;
export type EventKind = "scheduled" | "updated" | "cancelled";

export function eventEmail(
  kind: EventKind,
  ev: {
    title: string;
    starts_at: string;
    ends_at?: string | null;
    location?: string | null;
    description?: string | null;
    visibility: string;
  },
): { subject: string; text: string } {
  const verb = kind === "scheduled" ? "added" : kind === "updated" ? "updated" : "cancelled";
  const lines = [
    `An IvyIn event has been ${verb}: ${ev.title}`,
    "",
    `When: ${formatWhen(ev.starts_at, ev.ends_at ?? null)}`,
  ];
  if (ev.location) lines.push(`Where: ${ev.location}`);
  if (kind !== "cancelled") {
    if (ev.visibility === "private") {
      lines.push("", "This event is for IvyIn members. Log in to see the details.");
    } else if (ev.description) {
      lines.push("", ev.description);
    }
  }
  lines.push("", "Events calendar: https://ivy-in.com/events", "", "IvyIn");
  return { subject: `Event ${verb}: ${ev.title}`, text: lines.join("\n") };
}

// Emails every active student and staff member, in small batches.
export async function emailEveryone(supabase: Client, mail: { subject: string; text: string }) {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .in("role", ["user", "advisor", "admin"])
    .is("archived_at", null);
  const list = [...new Set((data ?? []).map((p) => p.email).filter((e): e is string => Boolean(e)))];
  for (let i = 0; i < list.length; i += 20) {
    await Promise.all(list.slice(i, i + 20).map((to) => sendEmail({ to, ...mail })));
  }
}
