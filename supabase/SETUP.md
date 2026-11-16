# Authentication setup — manual steps required

## Current status

The React code is implemented. The database migration has **not** been applied to a hosted Supabase project and its RLS tests have **not** been run here. Do not describe deployed admin access as secure or fully operational until the steps below pass on your project.

Customer routes require a session verified with Supabase Auth. Admin routes additionally call `public.is_admin()` and fail closed on missing functions, network errors or a false response. The route guard is a user-interface gate; actual database enforcement is in Postgres permissions and RLS. Static JavaScript and fictional sample records remain downloadable, including through the PWA cache. Never place private data or secrets in these files.

The migration secures only the new `profiles` and `staff_roles` tables. It does not audit or protect pre-existing tables in your project. No plant/customer records are connected. Future tables and Storage buckets need their own tested owner/staff policies before use; a route guard does not protect an API.

## 1. Apply and test the migration first

Use a separate development/test Supabase project first. In its dashboard, open **SQL Editor → New query**. Paste the complete contents of `supabase/migrations/202611160001_auth_roles.sql`, review it, and click **Run** as the project owner. Run it once; it deliberately fails instead of replacing existing tables with the same names.

Next run `supabase/tests/auth_roles.sql` in a new SQL Editor query. It creates temporary test users inside a transaction and ends with `ROLLBACK`; it must finish without errors. If a query errors, run `ROLLBACK;` before another query if the editor still has an open transaction. The tests check anonymous denial, own-profile access, blocked self-promotion (including forged user metadata), protected staff membership, and immediate role revocation. The fictional fixture IDs must not already exist.

After reviewing the result, the owner can apply the same migration to the intended project. Do not run destructive or experimental tests against real customer records. Keep the SQL results as deployment evidence. No migrations have been applied by this code change.

## 2. Configure Supabase Auth and your local environment

- In **Authentication → Providers → Email**, enable email/password sign-in and require email confirmation. Configure a minimum password length of at least 12 characters in Supabase too; the browser rule alone is not enforcement. Configure production SMTP and appropriate email rate limits before real use.
- In **Authentication → URL Configuration**, set **Site URL** to the intended app origin. Add exact redirect URLs for each trusted environment, for example:
  - `http://localhost:5173/?auth=confirm`
  - `http://localhost:5173/?auth=recovery`
  - `http://localhost:4173/?auth=confirm` and `http://localhost:4173/?auth=recovery` for production preview
  - `https://YOUR-APP-DOMAIN/?auth=confirm`
  - `https://YOUR-APP-DOMAIN/?auth=recovery`
- Use the actual deployed pathname if hosting under a subdirectory. Do not use broad wildcard preview domains for authentication redirects. Keep the email templates' confirmation links using Supabase's `ConfirmationURL` so the PKCE exchange works.
- Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` to your project URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key. Never use a secret or service-role key. Restart Vite after changes.
- When a separate deployment is authorised, these same two public build variables will be needed in Cloudflare Pages before building. This task does not change Cloudflare settings or deploy.

Email confirmation and reset use PKCE. Open the email link in the **same browser and device** that requested it; another browser cannot access the verifier. Expired or cross-browser reset links require a new request. Supabase exchanges the query-string code; the app selects the appropriate hash route. Hash routes avoid needing additional Cloudflare routing settings.

Sessions persist in the browser using Supabase's storage and refresh handling. Passwords are submitted only to Supabase Auth, never stored by this app. Sign out on shared devices. Sign-out affects this browser. Already-issued access tokens can remain valid until their normal expiry; database role removal is checked on each RPC call and is not stored in user-editable metadata. Authenticated API responses are not added to the PWA cache. Offline use cannot pass fresh session/staff verification.

## 3. Authorise the first admin securely

1. The intended administrator signs up through the normal customer registration screen and confirms their email. There is no admin registration option.
2. As the trusted project owner, open **Authentication → Users**. Verify the person's identity outside the app and copy their exact **User UID**. An email string is not proof of staff status.
3. In the SQL Editor as project owner, replace the placeholder below with that verified UID and run:

```sql
insert into public.staff_roles (user_id, role)
values ('REPLACE-WITH-VERIFIED-USER-UUID'::uuid, 'admin');
```

This operation is intentionally unavailable to browser clients, including admins. Do not put the SQL owner's credentials or any service-role key into the app. Additional staff are provisioned by the same trusted process. No account is automatically promoted.

To revoke access, the project owner runs:

```sql
delete from public.staff_roles
where user_id = 'REPLACE-WITH-VERIFIED-USER-UUID'::uuid;
```

On the next role check, access is denied without waiting for a JWT role claim to expire. The app rechecks on navigation, session changes and window focus. A page already open is not a security boundary: every future sensitive database operation must independently enforce RLS.

## 4. Verify the live flows before calling this operational

Run `npm ci`, `npm run check`, `npm test`, and `npm run build`. Then `npm run dev` (or production preview after building).

1. With no environment variables, sign-in should show a setup message; direct customer/admin routes must not reveal dashboards.
2. Sign up with a test customer, confirm the email in the same browser, sign in, reload and verify the session persists. Try a wrong password and inspect the visible error.
3. Visit all customer routes. Visit `/#/admin/overview` as that customer: it must deny access. Changing user metadata to `{"role":"admin"}` must not change the result.
4. Request a password-reset email, follow it in the same browser, and set a new password. Confirm the old password fails and the new one works. Also test expired links and another browser. Check signup/reset delivery with your email provider.
5. Provision a test admin using the owner-only SQL above. Verify all admin routes work. Revoke the role and reload; access must be denied. Disconnect the network and retry: no admin access should be granted.
6. Sign out. Try browser back and direct protected URLs; sign-in must be required. Check another tab receives the sign-out event.
7. Run the SQL security tests in the test project. Independently confirm direct REST/RPC requests with anonymous and customer tokens cannot read another profile or change roles. This verifies actual deployed policies, beyond mocked UI tests.
8. Check at 320px and 390px widths and desktop: account forms, navigation, photo previews and sign-out in the mobile menu. Verify the production PWA manifest/service worker and installation separately.

Only after the database and real email/session checks pass should this be treated as operational authentication. Existing garden forms remain fictional previews and do not save to Supabase.
