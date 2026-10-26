"use server";

import { getContext } from "@/lib/auth";

// Staff only. The database function checks the same thing again.
export async function markActivitySeen() {
  const ctx = await getContext();
  if (!ctx || !ctx.isStaff || ctx.aal !== "aal2") return;
  await ctx.supabase.rpc("mark_activity_seen");
}
