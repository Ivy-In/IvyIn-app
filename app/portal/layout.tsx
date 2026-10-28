import Link from "next/link";
import { redirect } from "next/navigation";
import { getContext } from "@/lib/auth";
import { getUnread } from "@/lib/activity";
import { Bubble } from "@/components/Bubble";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/portal");

  // Staff must complete a second factor before seeing any client data.
  if (ctx.isStaff && ctx.aal !== "aal2") redirect("/mfa");

  // Notification bubbles: new items since staff last opened the Activity page.
  const unread = ctx.isStaff ? await getUnread(ctx.supabase, ctx.user.id) : null;

  return (
    <>
      <header className="top">
        <div className="wrap">
          <Link href="/" className="mk-brand" aria-label="IvyIn home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-header-light.png" alt="IvyIn" width={1488} height={458} />
          </Link>
          {ctx.isStaff && <span className="badge">{ctx.role}</span>}
          <nav className="portal-nav">
            <Link href="/portal">Home</Link>
            {ctx.isStaff && <Link href="/portal/activity">Activity<Bubble n={unread?.total ?? 0} /></Link>}
            <Link href="/portal/messages">Messages{unread && <Bubble n={unread.counts.message} />}</Link>
            <Link href="/portal/files">Files{unread && <Bubble n={unread.counts.file} />}</Link>
            {ctx.isStaff && <Link href="/portal/students">Students{unread && <Bubble n={unread.counts.signup} />}</Link>}
            {ctx.isStaff && <Link href="/portal/sites">Sites</Link>}
            {ctx.role === "admin" && <Link href="/admin">Admin</Link>}
            <form action="/logout" method="post" style={{ display: "inline" }}>
              <button className="btn ghost" type="submit" style={{ marginLeft: 16 }}>Log out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}
