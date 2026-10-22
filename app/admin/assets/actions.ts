"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // Website images are small. SVG is excluded because it can carry scripts.

export async function uploadAsset(formData: FormData) {
  const ctx = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect("/admin/assets?error=nofile");
  if (!TYPES.includes(file.type)) redirect("/admin/assets?error=type");
  if (file.size > MAX_BYTES) redirect("/admin/assets?error=large");

  const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "image";
  const path = `${Date.now()}-${safe}`;
  const { error } = await ctx.supabase.storage
    .from("site-assets")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) redirect("/admin/assets?error=upload");

  revalidatePath("/admin/assets");
  const { data } = ctx.supabase.storage.from("site-assets").getPublicUrl(path);
  redirect(`/admin/assets?ok=${encodeURIComponent(data.publicUrl)}`);
}

export async function deleteAsset(formData: FormData) {
  const ctx = await requireAdmin();
  const name = String(formData.get("name") ?? "");
  if (!name || name.includes("/")) redirect("/admin/assets?error=upload");
  await ctx.supabase.storage.from("site-assets").remove([name]);
  revalidatePath("/admin/assets");
  redirect("/admin/assets");
}
