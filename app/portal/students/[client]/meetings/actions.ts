"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getContext } from "@/lib/auth";
import { UUID } from "@/lib/dashboard";
import { etToIso } from "@/lib/events";
import { sendEmail } from "@/lib/mail";
import { isRecurrence, meetingEmail } from "@/lib/meetings";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

async function staff() {
  const ctx = await getContext();
  if (!ctx || !ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");
  return ctx;
}

// Reads the meeting form. Times are entered in Eastern time. Returns null if the title or start is missing.
function readForm(fd: FormData) {
  const title = String(fd.get("title") ?? "").trim().slice(0, 200);
  const startsAt = etToIso(String(fd.get("starts_at") ?? ""));
  const endsRaw = String(fd.get("ends_at") ?? "");
  let endsAt = endsRaw ? etToIso(endsRaw) : null;
  if (startsAt && endsAt && endsAt < startsAt) endsAt = null;
  const rec = String(fd.get("recurrence") ?? "none");
  const recurrence = isRecurrence(rec) ? rec : "none";
  const untilRaw = String(fd.get("recurrence_until") ?? "");
  const until = recurrence !== "none" && DATE.test(untilRaw) ? untilRaw : null;
  if (!title || !startsAt) return null;
  return {
    title,
    starts_at: startsAt,
    ends_at: endsAt,
    location: String(fd.get("location") ?? "").trim().slice(0, 200) || null,
    notes: String(fd.get("notes") ?? "").trim().slice(0, 2000) || null,
    recurrence,
    recurrence_until: until,
  };
}

// Emails the student and the staff member who made the change.
async function notify(
  ctx: Awaited<ReturnType<typeof staff>>,
  clientId: string,
  kind: "scheduled" | "updated" | "cancelled",
  m: Parameters<typeof meetingEmail>[1],
) {
  const { data: person } = await ctx.supabase
    .from("profiles")
    .select("email")
    .eq("id", clientId)
    .maybeSingle();
  const mail = meetingEmail(kind, m);
  const recipients = new Set(
    [person?.email, ctx.user.email].filter((x): x is string => Boolean(x)),
  );
  await Promise.all([...recipients].map((to) => sendEmail({ to, ...mail })));
}

export async function addMeeting(formData: FormData) {
  const ctx = await staff();
  const clientId = String(formData.get("client_id") ?? "");
  if (!UUID.test(clientId)) redirect("/portal/students");
  const path = `/portal/students/${clientId}/meetings`;

  const row = readForm(formData);
  if (!row) redirect(`${path}?error=invalid`);

  // Advisors can only add upcoming meetings. The database enforces this too.
  const { error } = await ctx.supabase
    .from("meetings")
    .insert({ ...row, client_id: clientId, advisor_id: ctx.user.id });
  if (error) redirect(`${path}?error=save`);

  await notify(ctx, clientId, "scheduled", row);
  revalidatePath(path);
  redirect(`${path}?saved=1`);
}

// Admins only.
export async function updateMeeting(formData: FormData) {
  const ctx = await staff();
  if (ctx.role !== "admin") redirect("/portal/students");
  const id = String(formData.get("id") ?? "");

  const { data: old } = await ctx.supabase
    .from("meetings")
    .select("client_id")
    .eq("id", id)
    .maybeSingle();
  if (!old) redirect("/portal/students");
  const path = `/portal/students/${old.client_id}/meetings`;

  const row = readForm(formData);
  if (!row) redirect(`${path}?error=invalid`);

  const { error } = await ctx.supabase
    .from("meetings")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) redirect(`${path}?error=save`);

  await notify(ctx, old.client_id, "updated", row);
  revalidatePath(path);
  redirect(`${path}?saved=1`);
}

// Admins only. The admin must tick the confirm box first.
export async function deleteMeeting(formData: FormData) {
  const ctx = await staff();
  if (ctx.role !== "admin") redirect("/portal/students");
  const id = String(formData.get("id") ?? "");

  const { data: old } = await ctx.supabase
    .from("meetings")
    .select("client_id, title, starts_at, ends_at, location, notes, recurrence, recurrence_until")
    .eq("id", id)
    .maybeSingle();
  if (!old) redirect("/portal/students");
  const path = `/portal/students/${old.client_id}/meetings`;
  if (formData.get("confirm") !== "on") redirect(`${path}?error=confirm`);

  const { error } = await ctx.supabase.from("meetings").delete().eq("id", id);
  if (error) redirect(`${path}?error=save`);

  await notify(ctx, old.client_id, "cancelled", old);
  revalidatePath(path);
  redirect(`${path}?saved=1`);
}
