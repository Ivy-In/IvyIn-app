import { createClient } from "@/lib/supabase/server";

export type Role = "user" | "advisor" | "admin";

// Returns the signed-in user, their role, and their MFA level, or null if signed out.
// The database enforces access regardless; this only decides which screens to show.
export async function getContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "user") as Role;

  return {
    supabase,
    user,
    role,
    isStaff: role === "admin" || role === "advisor",
    aal: aal?.currentLevel ?? "aal1",
    profile,
  };
}

// Only allow in-app paths for post-login redirects. Blocks open redirects.
export function safeNext(value: string | null | undefined, fallback = "/portal") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  // Browsers treat "/\\evil.com" and tab or newline tricks as another site, so resolve the value and
  // accept it only if it still points at this site.
  if (/[\\\u0000-\u001f]/.test(value)) return fallback;
  try {
    if (new URL(value, "https://site.invalid").origin !== "https://site.invalid") return fallback;
  } catch {
    return fallback;
  }
  return value;
}
