# IvyIn app (Phase 2)

Next.js app for the client portal, staff tools, private messaging, file upload, and student sites. Uses the Supabase database from `ivyin-platform` (Phase 1).

## Run it locally

1. Install Node.js 20.9 or newer (Next.js 16 requires it).
2. In this folder: `npm install`
3. Check `.env.local` exists with the Supabase URL and publishable key. It must not contain the service key.
4. `npm run dev`, then open http://localhost:3000

## Build and check

- `npm run typecheck`
- `npm run build`

## Supabase settings to check (in the Supabase dashboard)

- **Authentication → URL Configuration.** Site URL: `https://ivy-in.com`. Add `https://*.ivy-in.com` to the redirect URLs.
- **Authentication → Providers → Email.** Keep "Confirm email" on.
- **Authentication → Multi-factor.** Make sure TOTP is enabled.

## How access works

- `proxy.ts` refreshes the session on every request. It sends signed-out visitors away from `/portal` and from student sites, and it routes `<name>.ivy-in.com` to `/site/<name>`.
- Staff (advisors and admins) must complete a second factor (`/mfa`) before the portal opens. The database enforces this too.
- Every screen reads data through the signed-in user's own session, so the database rules apply. The app never uses the service key.
- Student sites send `noindex`, and a missing site and a site you can't see both return "not found".

## Known gaps

- **Orphaned uploads.** If a file's database record fails after the upload succeeds, the bytes stay in storage. Clients can't delete them. The reconciliation job needs to be built.
- **Sign-in on student subdomains.** Session cookies are per host, so signing in on `alice-demo.ivy-in.com` is separate from signing in at `ivy-in.com`. Staff sign in once per host.
- **Not tested against your live Supabase project.** The sandbox can't reach supabase.co. The build and the protected-route redirects are tested; the sign-in, MFA, upload, and messaging flows need a manual test on your side (see the test checklist).
- **Messages update on refresh.** Live updates through Supabase Realtime aren't wired up yet.
- **Personal emails per advisee** isn't built.
