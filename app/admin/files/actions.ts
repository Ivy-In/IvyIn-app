"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Deleting the row queues the stored bytes for removal (see files_queue_storage_deletion).
// The nightly job removes them from storage.
export async function deleteFile(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (formData.get("confirm") !== "yes") redirect("/admin/files?error=confirm");
  const { error } = await ctx.supabase.from("files").delete().eq("id", id);
  if (error) redirect("/admin/files?error=failed");
  revalidatePath("/admin/files");
  revalidatePath("/admin");
  redirect("/admin/files?deleted=1");
}
