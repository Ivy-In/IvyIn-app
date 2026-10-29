"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function setReviewed(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;
  const reviewed = formData.get("reviewed") === "true";
  await ctx.supabase.from("consultant_applications").update({ reviewed }).eq("id", id);
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}

// Permanently removes an application. The admin must tick the confirm box first.
export async function deleteApplication(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/applications");
  if (formData.get("confirm") !== "yes") redirect(`/admin/applications/${id}?error=confirm`);
  await ctx.supabase.from("consultant_applications").delete().eq("id", id);
  revalidatePath("/admin/applications");
  redirect("/admin/applications?deleted=1");
}
