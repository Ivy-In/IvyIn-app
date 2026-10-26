import Link from "next/link";
import { redirect } from "next/navigation";
import { getContext } from "@/lib/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/portal");

  // Staff must complete a second factor before seeing any client data.
  if (ctx.isStaff && ctx.aal !== "aal2") redirect("/mfa");

  return (
    <>
      <header className="top">
        <div className="wrap">
          <strong style={{ fontFamily: "Georgia, serif", color: "var(--green)" }}>
            IvyIn {ctx.isStaff && <span className="badge">{ctx.role}</span>}
          </strong>
          <nav>
            <Link href="/portal">Home</Link>
            <Link href="/portal/messages">Messages</Link>
            <Link href="/portal/files">Files</Link>
            {ctx.isStaff && <Link href="/portal/students">Students</Link>}
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
