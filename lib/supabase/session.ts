import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

export type PendingCookie = { name: string; value: string; options?: Record<string, unknown> };

// Used by middleware: refreshes the session and reports the signed-in user.
// Returns the cookies to write onto whichever response the middleware chooses.
export async function updateSession(request: NextRequest): Promise<{
  user: User | null;
  cookies: PendingCookie[];
}> {
  const pending: PendingCookie[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => pending.push(c as PendingCookie));
        },
      },
    }
  );

  // getUser() validates the session with Supabase. getSession() does not, so it is not used for access checks.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, cookies: pending };
}
