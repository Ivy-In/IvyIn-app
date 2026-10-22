# Going live: IvyIn runbook

Work through these in order. Each step says who does it. Steps marked **you** need your accounts, so I can't do them from here.

## 1. Supabase (**you**)

1. Open the SQL editor and run these files from `ivyin-platform/supabase/migrations/` in order: `0001_core.sql`, `0002_rls.sql`, `0003_marketing.sql`, `0004_operations.sql`. Each one runs once.
2. Run `ivyin-platform/supabase/seed/marketing.sql`. It's safe to re-run.
3. **Authentication → URL Configuration:** Site URL `https://ivy-in.com`. Add `https://*.ivy-in.com` and `https://ivy-in.com/**` to redirect URLs.
4. **Authentication → Multi-factor:** enable TOTP.
5. **Storage → client-files:** set the file size limit to 50 MB. Keep it private.
6. **Storage → site-assets:** keep it public.
7. Note the **service_role** key (Project Settings → API). It goes only into Vercel as `SUPABASE_SERVICE_ROLE_KEY` in step 3. Don't paste it into chat, email, or any `NEXT_PUBLIC_` variable.

## 2. Create the first admin (**you**)

1. Sign up on the site with your own email. Confirm the email.
2. In the SQL editor, make yourself the admin. This is the one-time bootstrap, because no admin exists yet:
   `update public.profiles set role = 'admin', admin_level = 'super_admin' where email = 'you@example.com';`
3. Sign in, go to `/mfa`, and enroll an authenticator app. Admins can't reach admin pages without it.
4. Add Curtis the same way once he has signed up. After that, use **Admin → Users**.

## 3. Hosting on Vercel (**you**)

1. Push `ivyin-app` to a GitHub repository.
2. In Vercel, import the repository. Framework: Next.js. Leave the build settings as they are.
3. Add these environment variables (Settings → Environment Variables):

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your project URL | public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key | public |
| `NEXT_PUBLIC_SITE_URL` | `https://ivy-in.com` | public |
| `ROOT_DOMAIN` | `ivy-in.com` | |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 1.7 | **server only** |
| `CRON_SECRET` | a long random string | Vercel Cron sends it automatically |
| `ALERT_EMAIL` | where storage and inquiry alerts go | |
| `RESEND_API_KEY` | from Resend (step 5) | optional until step 5 |
| `MAIL_FROM` | `IvyIn <no-reply@ivy-in.com>` | after the domain is verified |

4. Deploy. Check that `https://<project>.vercel.app` loads.

## 4. Domain (**you**)

1. In Vercel → Domains, add `ivy-in.com`. Follow the DNS record Vercel shows at your registrar.
2. Make `www` redirect to the apex, or the reverse, from the Domains page.
3. Test: `https://ivy-in.com` loads.

Student sites live at `https://ivy-in.com/site/<name>`. No wildcard DNS record is needed.

## 5. Email (**you**)

1. Create a Resend account and add `ivy-in.com` as a sending domain. Copy the DNS records it gives you into your DNS provider.
2. Once verified, set `RESEND_API_KEY` and `MAIL_FROM` in Vercel and redeploy.
3. Inquiry notifications and storage alerts go to `ALERT_EMAIL`. Without email set up, the contact form still saves inquiries. Check **Admin → Inquiries** in the meantime.

## 6. Nightly maintenance (automatic once deployed)

`vercel.json` runs `/api/cron/maintenance` every day at 06:00 UTC. Each run:
- removes the stored bytes for files deleted in the admin Files page,
- removes uploads that were stored but never recorded (older than an hour),
- checks total storage and emails `ALERT_EMAIL` at 40 GB and 45 GB.

Vercel's Hobby plan runs crons once a day, which is enough. To check it by hand, call the URL with `Authorization: Bearer <CRON_SECRET>`. You should get `{"ok": true, ...}`.

## 7. Go-live checklist (**you**, using a real student account)

- [ ] Sign up as a client, confirm the email, and sign in. The portal opens.
- [ ] Sign in as an advisor. MFA is required before any client data shows.
- [ ] Upload a file as a client. As staff, see it and download it.
- [ ] Send a message from each side. It appears on the other side without a refresh.
- [ ] Delete a file in Admin → Files. Run the maintenance URL, then confirm the file is gone from Storage.
- [ ] Provision a student site, publish a page, and confirm the student sees it at `/site/<name>` and nobody else does.
- [ ] Suspend a site. The student is shut out.
- [ ] Submit the contact form. The inquiry appears in Admin → Inquiries.
- [ ] Edit homepage copy in Admin → Content, then reload the public site.
- [ ] Turn on Supabase backups (daily backups need a paid Supabase plan).

## Open items

- **Personal emails per advisee.** Not built. A simple option is email forwarding from ivy-in.com addresses (for example Cloudflare Email Routing or Google Workspace groups). This needs a decision on which addresses to create.
- **Logo carousel.** Waiting on the logo files and written permission from each school.
- **Limits in place today.** Login and signup use Supabase's built-in rate limits. The contact form has a honeypot but no rate limit. No Content-Security-Policy header is set yet. Add one after a full test pass, because a strict policy can break the sign-in and upload flows.
- **Storage numbers.** Usage is the sum of recorded file sizes. It doesn't count storage that's been removed but not yet cleaned up by the nightly job.
