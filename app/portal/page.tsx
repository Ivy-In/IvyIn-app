import Link from "next/link";
import { getContext } from "@/lib/auth";
import { loadDashboard } from "@/lib/dashboard";
import { StudentDashboard } from "@/components/StudentDashboard";

export default async function PortalHome() {
  const ctx = await getContext();
  if (!ctx) return null; // layout already redirected

  // Students see their own dashboard here. Staff use the Students area instead.
  const dash = ctx.isStaff ? null : await loadDashboard(ctx.supabase, ctx.user.id);

  const { data: site } = await ctx.supabase
    .from("student_sites")
    .select("subdomain, status")
    .eq("client_id", ctx.user.id)
    .maybeSingle();

  const name = ctx.profile?.full_name ?? ctx.user.email ?? "there";

  // Live announcements only: row-level security hides hidden and expired ones.
  const { data: news } = await ctx.supabase
    .from("announcements")
    .select("id, title, body")
    .order("publish_at", { ascending: false })
    .limit(5);

  return (
    <>
      <h1>Welcome, {name}</h1>
      {(news ?? []).map((a) => (
        <div className="card" key={a.id}>
          <strong>{a.title}</strong>
          {a.body && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{a.body}</p>}
        </div>
      ))}
      {dash && (
        <>
          <h2>Your dashboard</h2>
          <StudentDashboard data={dash} clientId={ctx.user.id} canToggle backPath="/portal" />
        </>
      )}
      <div className="grid2">
        <div className="card">
          <h3>Messages</h3>
          <p className="muted">{ctx.isStaff ? "Conversations with clients." : "Your private thread with your advisors."}</p>
          <Link className="btn" href="/portal/messages">Open messages</Link>
        </div>
        <div className="card">
          <h3>Files</h3>
          <p className="muted">Upload documents and view files shared with you.</p>
          <Link className="btn" href="/portal/files">Open files</Link>
        </div>
      </div>
      {site && (
        <div className="card">
          <h3>Your site</h3>
          <p className="muted">
            Private to you and your advisors. <span className="badge">{site.status}</span>
          </p>
          {site.status === "active" && (
            <a className="btn ghost" href={`/site/${site.subdomain}`}>
              Open my site
            </a>
          )}
        </div>
      )}
    </>
  );
}
