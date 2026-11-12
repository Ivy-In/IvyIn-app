import type { Metadata } from "next";
import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { redirect } from "next/navigation";
import { getContext } from "@/lib/auth";
import { getUnread } from "@/lib/activity";
import { Bubble } from "@/components/Bubble";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/portal");

  // Staff must complete a second factor before seeing any client data.
  if (ctx.isStaff && ctx.aal !== "aal2") redirect("/mfa");

  // Students with a live private site get a quick link to it in the menu.
  const { data: site } = ctx.isStaff
    ? { data: null }
    : await ctx.supabase.from("student_sites").select("subdomain, status").eq("client_id", ctx.user.id).maybeSingle();

  // Notification bubbles: new items since staff last opened the Activity page.
  const unread = ctx.isStaff ? await getUnread(ctx.supabase, ctx.user.id) : null;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <div className="wrap">
          <Link href="/" className="mk-brand" aria-label="IvyIn home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-header-light.png" alt="IvyIn" width={768} height={304} />
          </Link>
          {ctx.isStaff && <span className="badge">{ctx.role}</span>}
          <nav className="portal-nav">
            <NavLink href="/portal" exact>Home</NavLink>
            {ctx.isStaff && <NavLink href="/portal/activity">Activity<Bubble n={unread?.total ?? 0} /></NavLink>}
            <NavLink href="/portal/messages">Messages{unread && <Bubble n={unread.counts.message} />}</NavLink>
            <NavLink href="/portal/files">Files{unread && <Bubble n={unread.counts.file} />}</NavLink>
            {site?.status === "active" && <NavLink href={`/site/${site.subdomain}`}>My site</NavLink>}
            {ctx.isStaff && <NavLink href="/portal/students">Students{unread && <Bubble n={unread.counts.signup} />}</NavLink>}
            {ctx.isStaff && <NavLink href="/portal/sites">Sites</NavLink>}
            {ctx.role === "admin" && <NavLink href="/admin">Admin</NavLink>}
            <form action="/logout" method="post" style={{ display: "inline" }}>
              <button className="btn ghost" type="submit" style={{ marginLeft: 16 }}>Log out</button>
            </form>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap">{children}</main>
    </>
  );
}
