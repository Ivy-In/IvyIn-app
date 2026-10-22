"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Times are entered in UTC.
function toIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v + "Z");
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function createAnnouncement(formData: FormData) {
  const ctx = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const body = String(formData.get("body") ?? "").trim().slice(0, 5000);
  if (!title) return;
  const publishAt = toIso(String(formData.get("publish_at") ?? "")) ?? new Date().toISOString();
  const expiresAt = toIso(String(formData.get("expires_at") ?? ""));
  await ctx.supabase.from("announcements").insert({
    title,
    body: body || null,
    published: formData.get("published") === "on",
    publish_at: publishAt,
    expires_at: expiresAt,
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/portal");
}

export async function setPublished(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  await ctx.supabase.from("announcements").update({ published }).eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/portal");
}

export async function deleteAnnouncement(formData: FormData) {
  const ctx = await requireAdmin();
  await ctx.supabase.from("announcements").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/announcements");
  revalidatePath("/portal");
}
