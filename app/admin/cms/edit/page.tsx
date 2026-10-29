import { requireAdmin } from "@/lib/admin";
import { saveCmsEntry } from "../actions";

const ERRORS: Record<string, string> = {
  slug: "The slug may use lowercase letters, numbers and single hyphens only.",
  json: "The content must be a valid JSON object. Check for missing commas or quotes.",
  save: "The entry could not be saved.",
};

const COLLECTIONS = ["page", "faq", "testimonial", "resource", "setting"];

export default async function EditCms({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; slug?: string; error?: string }>;
}) {
  const ctx = await requireAdmin();
  const sp = await searchParams;

  let existing: { data: unknown; published: boolean; sort_order: number } | null = null;
  if (sp.collection && sp.slug) {
    const { data } = await ctx.supabase
      .from("cms_entries")
      .select("data, published, sort_order")
      .eq("collection", sp.collection)
      .eq("slug", sp.slug)
      .maybeSingle();
    existing = data;
  }

  const collection = sp.collection ?? "page";
  const slug = sp.slug ?? "";
  const isExisting = existing !== null;
  const json = existing ? JSON.stringify(existing.data, null, 2) : "{\n  \n}";

  return (
    <>
      <h1>{isExisting ? `Edit ${collection}: ${slug}` : "New content entry"}</h1>
      <p className="muted">
        Content is JSON. For pages use keys like <code>headline</code>, <code>lede</code>, <code>eyebrow</code>,{" "}
        <code>sections</code> (a list of title and body), <code>closing</code>. For FAQs use <code>question</code> and{" "}
        <code>answer</code>.
      </p>
      {sp.error && <p className="error" role="alert">{ERRORS[sp.error] ?? "That did not work. Try again in a moment."}</p>}
      <div className="card">
        <form action={saveCmsEntry}>
          {isExisting ? (
            <>
              <input type="hidden" name="collection" value={collection} />
              <input type="hidden" name="slug" value={slug} />
              <p className="muted">{collection} / {slug}</p>
            </>
          ) : (
            <>
              <label htmlFor="collection">Type</label>
              <select id="collection" name="collection" defaultValue={collection}>
                {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label htmlFor="slug">Slug (for example: about, how-much)</label>
              <input id="slug" name="slug" defaultValue={slug} required />
            </>
          )}
          <label htmlFor="sort_order">Sort order (lower shows first)</label>
          <input id="sort_order" name="sort_order" type="number" defaultValue={existing?.sort_order ?? 0} />
          <label htmlFor="data">Content (JSON)</label>
          <textarea id="data" name="data" rows={22} defaultValue={json} style={{ fontFamily: "monospace", fontSize: 14 }} />
          <p style={{ marginTop: 12 }}>
            <label style={{ display: "inline", fontWeight: 400 }}>
              <input type="checkbox" name="published" defaultChecked={existing?.published ?? true} style={{ width: "auto", marginRight: 8 }} />
              Published (visible to visitors)
            </label>
          </p>
          <button className="btn" type="submit">Save</button>
        </form>
      </div>
    </>
  );
}
