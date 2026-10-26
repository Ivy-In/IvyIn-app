"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const ROLES = ["user", "advisor", "admin"];
const LEVELS = ["super_admin", "editor", "support"];

export async function setRole(formData: FormData) {
  const ctx = await requireAdmin();
  const target = String(formData.get("target") ?? "");
  const role = String(formData.get("role") ?? "");
  const level = String(formData.get("level") ?? "");
  if (!ROLES.includes(role)) redirect("/admin/users?error=invalid");
  const newLevel = role === "admin" && LEVELS.includes(level) ? level : null;

  // The database also checks that only admins can call this and that admins cannot demote themselves.
  const { error } = await ctx.supabase.rpc("set_user_role", {
    target,
    new_role: role,
    new_level: newLevel,
  });
  if (error) redirect(`/admin/users?error=${error.message.includes("cannot remove") ? "self" : "failed"}`);

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Archive or restore a student. Archiving hides the student from staff views (database rule)
// and blocks sign-in (auth admin API, service role, server-only). Restoring reverses both.
export async function setArchived(formData: FormData) {
  const ctx = await requireAdmin();
  const target = String(formData.get("target") ?? "");
  const archive = formData.get("archive") === "yes";
  if (!UUID.test(target)) redirect("/admin/users?error=invalid");
  if (archive && formData.get("confirm") !== "yes") redirect("/admin/users?error=confirm");

  const { error } = await ctx.supabase.rpc("set_client_archived", { target, archive });
  if (error) redirect(`/admin/users?error=${error.message.includes("cannot archive your own") ? "self" : "failed"}`);

  // Database rule is in place; now block or unblock sign-in. Running this again is safe if it fails.
  const { error: authError } = await createAdminClient().auth.admin.updateUserById(target, {
    ban_duration: archive ? "876000h" : "none",
  });
  if (authError) redirect("/admin/users?error=auth");

  revalidatePath("/admin/users");
  revalidatePath("/portal/students");
  redirect(`/admin/users?saved=${archive ? "archived" : "restored"}`);
}
