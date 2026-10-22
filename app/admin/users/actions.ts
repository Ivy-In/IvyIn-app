"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

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
