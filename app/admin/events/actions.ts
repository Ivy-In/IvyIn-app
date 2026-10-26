"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { etToIso, isEventColor, safeLink } from "@/lib/events";

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
  await ctx.supabase.from("events").insert(row);
  refresh();
}

export async function updateEvent(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const row = readForm(formData);
  if (!id || !row) return;
  await ctx.supabase.from("events").update(row).eq("id", id);
  refresh();
}

export async function setPublished(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  await ctx.supabase.from("events").update({ published }).eq("id", id);
  refresh();
}

export async function deleteEvent(formData: FormData) {
  const ctx = await requireAdmin();
  await ctx.supabase.from("events").delete().eq("id", String(formData.get("id") ?? ""));
  refresh();
}
