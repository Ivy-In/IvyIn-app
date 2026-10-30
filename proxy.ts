import { NextResponse, type NextRequest } from "next/server";
import { updateSession, type PendingCookie } from "@/lib/supabase/session";

// Student sites live at /site/<name> on the main domain. Each page checks access in the database.
// Matched as whole path segments, so /sitemap.xml is not mistaken for /site.
const PROTECTED_PREFIXES = ["/portal", "/admin", "/site"];

function applyCookies(res: NextResponse, cookies: PendingCookie[]) {
  cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options as never));
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { user, cookies } = await updateSession(request);

  let res: NextResponse;
  if (!user && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    res = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url)
    );
  } else {
    res = NextResponse.next();
  }

  return applyCookies(res, cookies);
}

export const config = {
  // Skip static assets. Everything else goes through the session check.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
