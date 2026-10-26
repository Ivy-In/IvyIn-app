import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Holds the one-hour pass a visitor gets after entering today's sign-up code.
export const PASS_COOKIE = "ivyin_signup_pass";

// Returns the pass token if it is still valid, otherwise null. The database checks the token.
export async function getSignupPass(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(PASS_COOKIE)?.value;
  if (!token) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("signup_pass_valid", { p_token: token });
  return data === true ? token : null;
}
