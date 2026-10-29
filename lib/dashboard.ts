import type { createClient } from "@/lib/supabase/server";

type Sb = Awaited<ReturnType<typeof createClient>>;

// Keep in sync with the check constraint in supabase/migrations/0005_student_dashboard.sql.
export const CATEGORIES = [
  { key: "academics", label: "Academics" },
  { key: "testing", label: "Testing" },
  { key: "activities", label: "Activities" },
  { key: "essays", label: "Essays" },
  { key: "applications", label: "Applications" },
  { key: "deadlines", label: "Deadlines" },
] as const;

export type Category = (typeof CATEGORIES)[number]["key"];

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((c) => c.key === value);
}

// Keep in sync with the check constraint in supabase/migrations/0015_goal_tiers.sql.
export const GOAL_TIERS = [
  { key: "high_reach", label: "High reach" },
  { key: "reach", label: "Reach" },
  { key: "target", label: "Target" },
  { key: "safety", label: "Safety" },
] as const;

export type GoalTier = (typeof GOAL_TIERS)[number]["key"];

export function isGoalTier(value: string): value is GoalTier {
  return GOAL_TIERS.some((t) => t.key === value);
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Empty input becomes null. Anything outside [min, max] or not a number is invalid.
export function parseOptionalNumber(raw: string, min: number, max: number) {
  const text = raw.trim();
  if (text === "") return { ok: true as const, value: null };
  const n = Number(text);
  if (!Number.isFinite(n) || n < min || n > max) return { ok: false as const };
  return { ok: true as const, value: Math.round(n * 100) / 100 };
}

export function formatDue(iso: string | null) {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Reads one student's dashboard. Row-level security decides what comes back.
export async function loadDashboard(sb: Sb, clientId: string) {
  const [profileRes, goalsRes, itemsRes] = await Promise.all([
    sb
      .from("student_profiles")
      .select("current_grade, school, gpa_unweighted, gpa_weighted, sat_total, act_composite")
      .eq("client_id", clientId)
      .maybeSingle(),
    sb
      .from("student_goals")
      .select("id, school, program, tier")
      .eq("client_id", clientId)
      .order("sort_order")
      .order("created_at"),
    sb
      .from("student_items")
      .select("id, category, title, detail, due_on, done")
      .eq("client_id", clientId)
      .order("due_on", { ascending: true, nullsFirst: false })
      .order("sort_order")
      .order("created_at"),
  ]);

  return {
    profile: profileRes.data,
    goals: goalsRes.data ?? [],
    items: itemsRes.data ?? [],
  };
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;
