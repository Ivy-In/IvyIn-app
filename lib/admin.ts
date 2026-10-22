import { redirect } from "next/navigation";
import { getContext } from "@/lib/auth";

// Every admin page and admin server action calls this. It is not the only check:
// the database rules also require the admin role and MFA.
export async function requireAdmin() {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/admin");
  if (ctx.role !== "admin") redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");
  return ctx;
}
