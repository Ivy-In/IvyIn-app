"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getContext } from "@/lib/auth";
import { DATE, UUID, isCategory, parseOptionalNumber } from "@/lib/dashboard";

// Only return to in-portal pages. Blocks open redirects.
function safeBack(value: string) {
  return value.startsWith("/portal") && !value.startsWith("//") ? value : "/portal";
}

function withError(back: string, code: string) {
  return `${back}${back.includes("?") ? "&" : "?"}error=${code}`;
}

function withSaved(back: string, what: string) {
  return `${back}${back.includes("?") ? "&" : "?"}saved=${what}`;
}

// Ticking an item: students tick their own items, staff tick any visible client's item.
// The database function set_item_done checks which items the caller can see.
export async function toggleItem(formData: FormData) {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/portal");
  if (ctx.isStaff && ctx.aal !== "aal2") redirect("/mfa");

  const id = String(formData.get("id") ?? "");
  const done = formData.get("done") === "true";
  const back = safeBack(String(formData.get("back") ?? "/portal"));
  if (!UUID.test(id)) redirect(withError(back, "invalid"));

  const { error } = await ctx.supabase.rpc("set_item_done", { p_item: id, p_done: done });
  if (error) redirect(withError(back, "save"));

  revalidatePath(back);
}

// ---- Staff only from here on. Each action checks MFA and the target client.

async function staffContext(clientId: string) {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  if (!ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");
  if (!UUID.test(clientId)) redirect("/portal/students");
  const back = `/portal/students/${clientId}`;
  return { ctx, back };
}

export async function saveProfile(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const { ctx, back } = await staffContext(clientId);

  const grade = parseOptionalNumber(String(formData.get("current_grade") ?? ""), 6, 13);
  const unweighted = parseOptionalNumber(String(formData.get("gpa_unweighted") ?? ""), 0, 4.5);
  const weighted = parseOptionalNumber(String(formData.get("gpa_weighted") ?? ""), 0, 6);
  const sat = parseOptionalNumber(String(formData.get("sat_total") ?? ""), 400, 1600);
  const act = parseOptionalNumber(String(formData.get("act_composite") ?? ""), 1, 36);
  const school = String(formData.get("school") ?? "").trim().slice(0, 120);

  if (!grade.ok || !unweighted.ok || !weighted.ok || !sat.ok || !act.ok) redirect(withError(back, "invalid"));
  // Whole numbers only for grade, SAT and ACT.
  if (grade.value !== null && !Number.isInteger(grade.value)) redirect(withError(back, "invalid"));
  if (sat.value !== null && !Number.isInteger(sat.value)) redirect(withError(back, "invalid"));
  if (act.value !== null && !Number.isInteger(act.value)) redirect(withError(back, "invalid"));

  const { error } = await ctx.supabase.from("student_profiles").upsert(
    {
      client_id: clientId,
      current_grade: grade.value,
      school: school || null,
      gpa_unweighted: unweighted.value,
      gpa_weighted: weighted.value,
      sat_total: sat.value,
      act_composite: act.value,
    },
    { onConflict: "client_id" }
  );
  if (error) redirect(withError(back, "save"));

  revalidatePath(back);
  redirect(withSaved(back, "profile"));
}

export async function addGoal(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const { ctx, back } = await staffContext(clientId);

  const school = String(formData.get("school") ?? "").trim();
  const program = String(formData.get("program") ?? "").trim();
  if (!school || school.length > 120 || program.length > 120) redirect(withError(back, "invalid"));

  const { error } = await ctx.supabase.from("student_goals").insert({
    client_id: clientId,
    school,
    program: program || null,
  });
  if (error) redirect(withError(back, "save"));

  revalidatePath(back);
  redirect(withSaved(back, "goal"));
}

export async function deleteGoal(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const { ctx, back } = await staffContext(clientId);
  if (!UUID.test(id)) redirect(withError(back, "invalid"));

  const { error } = await ctx.supabase.from("student_goals").delete().eq("id", id).eq("client_id", clientId);
  if (error) redirect(withError(back, "save"));

  revalidatePath(back);
}

export async function addItem(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const { ctx, back } = await staffContext(clientId);

  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const dueOn = String(formData.get("due_on") ?? "").trim();

  if (!isCategory(category) || !title || title.length > 200 || detail.length > 2000) {
    redirect(withError(back, "invalid"));
  }
  if (dueOn && !DATE.test(dueOn)) redirect(withError(back, "invalid"));

  const { error } = await ctx.supabase.from("student_items").insert({
    client_id: clientId,
    category,
    title,
    detail: detail || null,
    due_on: dueOn || null,
  });
  if (error) redirect(withError(back, "save"));

  revalidatePath(back);
  redirect(withSaved(back, "item"));
}

export async function deleteItem(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const { ctx, back } = await staffContext(clientId);
  if (!UUID.test(id)) redirect(withError(back, "invalid"));

  const { error } = await ctx.supabase.from("student_items").delete().eq("id", id).eq("client_id", clientId);
  if (error) redirect(withError(back, "save"));

  revalidatePath(back);
}
