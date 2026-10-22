import { notFound, redirect } from "next/navigation";
import { getContext } from "@/lib/auth";

// Reached at /site/<name>. Signed-out visitors are sent to sign in first.
// A missing site and a site you may not see both return "not found", so the page
// never reveals which subdomains exist.
export default async function StudentSitePage({
  params,
}: {
  params: Promise<{ sub: string }>;
}) {
  const { sub } = await params;
  if (!/^[a-z][a-z0-9-]{2,39}$/.test(sub)) notFound();

  const ctx = await getContext();
  if (!ctx) redirect(`/login?next=/site/${sub}`);

  // Row-level security returns the site only to its client and to MFA-verified staff.
  const { data: site } = await ctx.supabase
    .from("student_sites")
    .select("client_id, subdomain, status")
    .eq("subdomain", sub)
    .maybeSingle();

  if (!site) notFound();
  if (site.status !== "active" && !ctx.isStaff) notFound();

  // Staff who aren't MFA-verified see nothing here, which the database also enforces.
  if (ctx.isStaff && ctx.aal !== "aal2") redirect("/mfa");

  // Clients see published pages only. Staff see drafts too, enforced by row-level security.
  const { data: pages } = await ctx.supabase
    .from("student_pages")
    .select("slug, title, published, body")
    .eq("client_id", site.client_id)
    .order("slug");

  return (
    <main className="wrap">
      <div className="card">
        <h1>{site.subdomain}</h1>
        <p className="muted">Private student site. Only the student and their advisors can see this.</p>
      </div>
      {(pages ?? []).length === 0 && <div className="card"><p className="muted">No pages yet.</p></div>}
      {(pages ?? []).map((p) => (
        <div className="card" key={p.slug}>
          <h3>
            {p.title} {!p.published && <span className="badge draft">Draft</span>}
          </h3>
          <p className="muted">/{p.slug}</p>
        </div>
      ))}
    </main>
  );
}
