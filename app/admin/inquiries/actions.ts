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
