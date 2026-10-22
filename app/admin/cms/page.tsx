import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function CmsList({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const { data: rows } = await ctx.supabase
    .from("cms_entries")
    .select("collection, slug, published, sort_order, updated_at")
    .order("collection")
    .order("sort_order");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1>Content</h1>
        <Link className="btn" href="/admin/cms/edit">New entry</Link>
      </div>
      <p className="muted">
        Pages, FAQs and settings shown on the public site. Changes appear on the next visit. Only published entries
        are visible to visitors.
      </p>
      {sp.saved && <p className="msg">Saved {sp.saved}.</p>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Type</th><th>Slug</th><th>Status</th><th>Order</th><th>Updated</th></tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={`${r.collection}/${r.slug}`}>
                <td>{r.collection}</td>
                <td>
                  <Link href={`/admin/cms/edit?collection=${r.collection}&slug=${r.slug}`}>{r.slug}</Link>
                </td>
                <td>{r.published ? <span className="badge">published</span> : <span className="badge draft">draft</span>}</td>
                <td>{r.sort_order}</td>
                <td>{new Date(r.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
