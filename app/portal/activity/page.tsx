import Link from "next/link";
import { redirect } from "next/navigation";
import { getContext } from "@/lib/auth";
import { KIND_LABEL, getUnread, type ActivityKind } from "@/lib/activity";
import { MarkSeen } from "@/components/MarkSeen";

export default async function ActivityPage() {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/portal/activity");
  if (!ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");

  const unread = await getUnread(ctx.supabase, ctx.user.id);
  const { data: events } = await ctx.supabase
    .from("activity")
    .select("id, kind, client_id, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const since = new Date(unread.since).getTime();

  return (
    <>
      <h1>Activity</h1>
      <p className="muted">
        Sign-ups, uploads, client messages and contact requests. New items are marked until you next open this page.
      </p>
      <MarkSeen />

      <div className="card">
        {(events ?? []).length === 0 && <p className="muted">Nothing yet.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(events ?? []).map((e) => {
            const isNew = new Date(e.created_at).getTime() > since;
            const kind = e.kind as ActivityKind;
            // Contact requests belong to admins. Client events link to that client's editor.
            const href =
              kind === "inquiry"
                ? ctx.role === "admin"
                  ? "/admin/inquiries"
                  : null
                : e.client_id
                  ? `/portal/students/${e.client_id}`
                  : null;
            return (
              <li
                key={e.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  padding: "10px 0",
                  borderTop: "1px solid #eee",
                  background: isNew ? "var(--green-soft)" : "transparent",
                }}
              >
                <span className="badge" style={{ minWidth: 72, textAlign: "center" }}>{KIND_LABEL[kind]}</span>
                <span style={{ flex: 1, minWidth: 200 }}>
                  {href ? <Link href={href}>{e.summary}</Link> : e.summary}
                  {isNew && <strong style={{ marginLeft: 8, color: "var(--green)", fontSize: 12 }}>NEW</strong>}
                </span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {new Date(e.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
