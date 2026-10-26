import type { createClient } from "@/lib/supabase/server";

type Sb = Awaited<ReturnType<typeof createClient>>;

export type ActivityKind = "signup" | "file" | "message" | "inquiry";

export const KIND_LABEL: Record<ActivityKind, string> = {
  signup: "Sign-up",
  file: "File",
  message: "Message",
  inquiry: "Contact",
};

// Unread counts for one staff member: everything newer than their last visit to /portal/activity.
// Row-level security limits the rows to what that person may see.
export async function getUnread(sb: Sb, userId: string) {
  const { data: row } = await sb
    .from("activity_reads")
    .select("seen_at")
    .eq("profile_id", userId)
    .maybeSingle();
  const since = row?.seen_at ?? "1970-01-01T00:00:00Z";

  const { data } = await sb.from("activity").select("kind").gt("created_at", since).limit(1000);

  const counts: Record<ActivityKind, number> = { signup: 0, file: 0, message: 0, inquiry: 0 };
  for (const r of data ?? []) counts[r.kind as ActivityKind] += 1;
  const total = counts.signup + counts.file + counts.message + counts.inquiry;

  return { since, counts, total };
}
