import Link from "next/link";
import { getContext } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SitesIndex() {
  const ctx = await getContext();
  if (!ctx || !ctx.isStaff) redirect("/portal");
  if (ctx.aal !== "aal2") redirect("/mfa");

  const { data: sites } = await ctx.supabase
    .from("student_sites")
    .select("client_id, subdomain, status, profiles:client_id(full_name, email)")
    .order("subdomain");

  return (
    <>
      <h1>Student sites</h1>
      <p className="muted">Edit the pages on each student's private site. Admins create and suspend sites on the Admin page.</p>
      <div className="card">
        {(sites ?? []).length === 0 && <p className="muted">No sites yet.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(sites ?? []).map((s) => {
            const owner = s.profiles as unknown as { full_name: string | null; email: string | null } | null;
            return (
              <li key={s.client_id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <Link href={`/portal/sites/${s.client_id}`}>/site/{s.subdomain}</Link>{" "}
                <span className="muted">({owner?.full_name ?? owner?.email}) · {s.status}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
