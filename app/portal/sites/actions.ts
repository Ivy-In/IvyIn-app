"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getContext } from "@/lib/auth";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Staff (advisors and admins) edit student site pages. Row-level security allows this only with MFA.
export async function savePage(formData: FormData) {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  if (!ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");

  const clientId = String(formData.get("client_id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const raw = String(formData.get("body") ?? "");
  const published = formData.get("published") === "on";
  const back = `/portal/sites/${clientId}`;

  if (!UUID.test(clientId) || !SLUG.test(slug) || !title) redirect(`${back}?error=invalid`);

  let body: unknown;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    redirect(`${back}?error=json`);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) redirect(`${back}?error=json`);

  const { error } = await ctx.supabase
    .from("student_pages")
    .upsert(
      { client_id: clientId, slug, title, body, published, updated_by: ctx.user.id },
      { onConflict: "client_id,slug" }
    );
  if (error) redirect(`${back}?error=save`);

  revalidatePath(back);
  redirect(`${back}?saved=${encodeURIComponent(slug)}`);
}
