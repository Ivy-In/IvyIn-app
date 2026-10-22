"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const COLLECTIONS = ["page", "faq", "testimonial", "resource", "setting"];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function saveCmsEntry(formData: FormData) {
  const ctx = await requireAdmin();
  const collection = String(formData.get("collection") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const raw = String(formData.get("data") ?? "");
  const published = formData.get("published") === "on";
  const sortOrder = Number.parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;

  if (!COLLECTIONS.includes(collection) || !SLUG.test(slug)) {
    redirect(`/admin/cms/edit?error=slug&collection=${collection}&slug=${encodeURIComponent(slug)}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    redirect(`/admin/cms/edit?error=json&collection=${collection}&slug=${slug}`);
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    redirect(`/admin/cms/edit?error=json&collection=${collection}&slug=${slug}`);
  }

  const { error } = await ctx.supabase
    .from("cms_entries")
    .upsert(
      { collection, slug, data, published, sort_order: sortOrder },
      { onConflict: "collection,slug" }
    );
  if (error) redirect(`/admin/cms/edit?error=save&collection=${collection}&slug=${slug}`);

  revalidatePath("/", "layout");
  redirect(`/admin/cms?saved=${collection}`);
}
