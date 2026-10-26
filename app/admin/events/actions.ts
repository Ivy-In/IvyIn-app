"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { etToIso, isEventColor, safeLink } from "@/lib/events";
import { emailEveryone, eventEmail } from "@/lib/event-notify";

// Reads the event form. Returns null when the title or start time is missing or invalid.
function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const startsAt = etToIso(String(formData.get("starts_at") ?? ""));
  const endsRaw = String(formData.get("ends_at") ?? "");
  let endsAt = endsRaw ? etToIso(endsRaw) : null;
  // ISO strings in the same format compare correctly as text. An end before the start is dropped.
  if (startsAt && endsAt && endsAt < startsAt) endsAt = null;
  const colorRaw = String(formData.get("color") ?? "");
  if (!title || !startsAt) return null;
  return {
    title,
    starts_at: startsAt,
    ends_at: endsAt,
    location: String(formData.get("location") ?? "").trim().slice(0, 200) || null,
    description: String(formData.get("description") ?? "").trim().slice(0, 5000) || null,
    more_info_url: safeLink(String(formData.get("more_info_url") ?? "").trim()),
    color: isEventColor(colorRaw) ? colorRaw : "forest",
    visibility: formData.get("visibility") === "private" ? "private" : "public",
    published: formData.get("published") === "on",
  };
}

function refresh() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function createEvent(formData: FormData) {
  const ctx = await requireAdmin();
  const row = readForm(formData);
  if (!row) return;
  const { error } = await ctx.supabase.from("events").insert(row);
  if (!error && row.published) await emailEveryone(ctx.supabase, eventEmail("scheduled", row));
  refresh();
}

export async function updateEvent(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const row = readForm(formData);
  if (!id || !row) return;
  const { data: old } = await ctx.supabase.from("events").select("published").eq("id", id).maybeSingle();
  const { error } = await ctx.supabase.from("events").update(row).eq("id", id);
  // Email when the event is or was public on the calendar. Draft edits stay quiet.
  if (!error && (row.published || old?.published)) {
    await emailEveryone(ctx.supabase, eventEmail(row.published ? "updated" : "cancelled", row));
  }
  refresh();
}

export async function setPublished(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  const { data: ev } = await ctx.supabase
    .from("events")
    .select("title, starts_at, ends_at, location, description, visibility")
    .eq("id", id)
    .maybeSingle();
  const { error } = await ctx.supabase.from("events").update({ published }).eq("id", id);
  if (!error && ev) {
    await emailEveryone(ctx.supabase, eventEmail(published ? "scheduled" : "cancelled", ev));
  }
  refresh();
}

export async function deleteEvent(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { data: ev } = await ctx.supabase
    .from("events")
    .select("title, starts_at, ends_at, location, description, visibility, published")
    .eq("id", id)
    .maybeSingle();
  const { error } = await ctx.supabase.from("events").delete().eq("id", id);
  if (!error && ev?.published) {
    await emailEveryone(ctx.supabase, eventEmail("cancelled", ev));
  }
  refresh();
}
