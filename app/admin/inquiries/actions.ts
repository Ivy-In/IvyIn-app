"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export async function setHandled(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const handled = formData.get("handled") === "true";
  await ctx.supabase.from("inquiries").update({ handled }).eq("id", id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

// Permanently removes an inquiry. The admin must tick the confirm box first.
export async function deleteInquiry(formData: FormData) {
  const ctx = await requireAdmin();
  if (formData.get("confirm") !== "on") return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await ctx.supabase.from("inquiries").delete().eq("id", id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}
