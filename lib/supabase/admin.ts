import { createClient } from "@supabase/supabase-js";

// Service-role client. Server-only, and used only by the maintenance job.
// Request handling for users never uses it, so row-level security always applies to them.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
