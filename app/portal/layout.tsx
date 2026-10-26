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
          <strong style={{ fontFamily: "Georgia, serif", color: "var(--green)" }}>
            IvyIn {ctx.isStaff && <span className="badge">{ctx.role}</span>}
          </strong>
          <nav>
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
