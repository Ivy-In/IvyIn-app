import { notFound, redirect } from "next/navigation";
import { getContext } from "@/lib/auth";
import { savePage } from "../actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ERRORS: Record<string, string> = {
  invalid: "Use a slug with lowercase letters, numbers and hyphens, and give the page a title.",
  json: "The page body must be a valid JSON object.",
  save: "The page could not be saved.",
};

export default async function StudentSiteEditor({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>;
  searchParams: Promise<{ saved?: string; error?: string; slug?: string }>;
}) {
  const { client } = await params;
  if (!UUID.test(client)) notFound();

  const ctx = await getContext();
  if (!ctx || !ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");
  const sp = await searchParams;

  const [{ data: site }, { data: pages }] = await Promise.all([
    ctx.supabase.from("student_sites").select("subdomain, status").eq("client_id", client).maybeSingle(),
    ctx.supabase
      .from("student_pages")
      .select("slug, title, body, published")
      .eq("client_id", client)
      .order("slug"),
  ]);
  if (!site) notFound();

  // Pre-fill the form from an existing page when one is selected with ?slug=.
  const current = (pages ?? []).find((p) => p.slug === sp.slug) ?? null;
  const json = JSON.stringify(current?.body ?? { text: "" }, null, 2);

  return (
    <>
      <h1>ivy-in.com/site/{site.subdomain}</h1>
      <p className="muted">
        Private to the student and staff. <span className="badge">{site.status}</span>
      </p>
      {sp.saved && <p className="msg">Saved {sp.saved}.</p>}
      {sp.error && <p className="error">{ERRORS[sp.error] ?? "Something went wrong."}</p>}

      <div className="grid2">
        <div className="card">
          <h3>Pages</h3>
          {(pages ?? []).length === 0 && <p className="muted">No pages yet.</p>}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {(pages ?? []).map((p) => (
              <li key={p.slug} style={{ padding: "6px 0" }}>
                <a href={`/portal/sites/${client}?slug=${p.slug}`}>{p.title}</a>{" "}
                {!p.published && <span className="badge draft">Draft</span>}
                <div className="muted">/{p.slug}</div>
              </li>
            ))}
          </ul>
          <a className="btn ghost" href={`/portal/sites/${client}`}>New page</a>
        </div>

        <div className="card">
          <h3>{current ? `Edit: ${current.title}` : "New page"}</h3>
          <form action={savePage}>
            <input type="hidden" name="client_id" value={client} />
            <label htmlFor="slug">Slug (for example: essays)</label>
            <input id="slug" name="slug" required defaultValue={current?.slug ?? ""} readOnly={!!current} />
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required maxLength={200} defaultValue={current?.title ?? ""} />
            <label htmlFor="body">Content (JSON)</label>
            <textarea id="body" name="body" rows={14} defaultValue={json} style={{ fontFamily: "monospace", fontSize: 14 }} />
            <p style={{ marginTop: 12 }}>
              <label style={{ display: "inline", fontWeight: 400 }}>
                <input type="checkbox" name="published" defaultChecked={current?.published ?? false} style={{ width: "auto", marginRight: 8 }} />
                Published (visible to the student)
              </label>
            </p>
            <button className="btn" type="submit">Save page</button>
          </form>
        </div>
      </div>
    </>
  );
}
