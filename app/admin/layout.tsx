import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const LINKS: [string, string][] = [
  ["/admin", "Dashboard"],
  ["/admin/users", "Users"],
  ["/admin/inquiries", "Inquiries"],
  ["/admin/cms", "Content"],
  ["/admin/announcements", "Announcements"],
  ["/admin/sites", "Student sites"],
  ["/admin/files", "Files"],
  ["/admin/assets", "Images"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="top">
        <div className="wrap">
          <strong style={{ fontFamily: "Georgia, serif", color: "var(--green)" }}>
            IvyIn <span className="badge">admin</span>
          </strong>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
            <Link href="/portal">Portal</Link>
          </nav>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}
