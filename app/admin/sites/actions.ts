"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const SUB = /^[a-z][a-z0-9-]{2,39}$/;

export async function provisionSite(formData: FormData) {
  const ctx = await requireAdmin();
  const clientId = String(formData.get("client_id") ?? "");
  const subdomain = String(formData.get("subdomain") ?? "").trim().toLowerCase();
  if (!SUB.test(subdomain)) redirect("/admin/sites?error=subdomain");

  const { error } = await ctx.supabase.from("student_sites").insert({
    client_id: clientId,
    subdomain,
    status: "active",
    updated_by: ctx.user.id,
  });
  if (error) {
    // 23505 is a unique violation: the name or the client already has a site.
    redirect(`/admin/sites?error=${error.code === "23505" ? "taken" : "failed"}`);
  }
  revalidatePath("/admin/sites");
  redirect("/admin/sites?saved=1");
}

export async function setSiteStatus(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") === "suspended" ? "suspended" : "active";
  await ctx.supabase
    .from("student_sites")
    .update({ status, updated_by: ctx.user.id })
    .eq("id", id);
  revalidatePath("/admin/sites");
}
