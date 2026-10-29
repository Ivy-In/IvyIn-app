import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { requireAdmin } from "@/lib/admin";
import { getUnread } from "@/lib/activity";
import { Bubble } from "@/components/Bubble";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  const unread = await getUnread(ctx.supabase, ctx.user.id);

  // Each link shows its own unread count, plus the total on Activity.
  const LINKS: [string, string, number][] = [
    ["/admin", "Dashboard", 0],
    ["/admin/users", "Users", unread.counts.signup],
    ["/admin/inquiries", "Inquiries", unread.counts.inquiry],
    ["/admin/applications", "Applications", unread.counts.application],
    ["/admin/cms", "Content", 0],
    ["/admin/announcements", "Announcements", 0],
    ["/admin/events", "Events", 0],
    ["/admin/sites", "Student sites", 0],
    ["/admin/files", "Files", unread.counts.file],
    ["/admin/assets", "Images", 0],
  ];

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <div className="wrap">
          <Link href="/" className="mk-brand" aria-label="IvyIn home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-header-light.png" alt="IvyIn" width={1488} height={458} />
          </Link>
          <span className="badge">admin</span>
          <nav className="portal-nav" aria-label="Admin">
            <NavLink href="/portal/activity">Activity<Bubble n={unread.total} /></NavLink>
            {LINKS.map(([href, label, n]) => (
              <NavLink key={href} href={href} exact={href === "/admin"}>
                {label}
                <Bubble n={n} />
              </NavLink>
            ))}
            <NavLink href="/portal" exact>Portal</NavLink>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap">{children}</main>
    </>
  );
}
