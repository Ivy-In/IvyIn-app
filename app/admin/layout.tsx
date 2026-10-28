import Link from "next/link";
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
    ["/admin/cms", "Content", 0],
    ["/admin/announcements", "Announcements", 0],
    ["/admin/events", "Events", 0],
    ["/admin/sites", "Student sites", 0],
    ["/admin/files", "Files", unread.counts.file],
    ["/admin/assets", "Images", 0],
  ];

  return (
    <>
      <header className="top">
        <div className="wrap">
          <Link href="/" className="mk-brand" aria-label="IvyIn home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-header-light.png" alt="IvyIn" width={1488} height={458} />
          </Link>
          <span className="badge">admin</span>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/portal/activity">Activity<Bubble n={unread.total} /></Link>
            {LINKS.map(([href, label, n]) => (
              <Link key={href} href={href}>
                {label}
                <Bubble n={n} />
              </Link>
            ))}
            <Link href="/portal">Portal</Link>
          </nav>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}
