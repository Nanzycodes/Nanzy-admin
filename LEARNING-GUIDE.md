# Nanzy Admin: Build and Explain It From First Principles

This guide is a hands-on scheme of work for learning to rebuild, test, and explain this repository. Work through it in order, implementing a small vertical slice at a time rather than copying every file blindly.

## What this application is

Nanzy Admin is a Next.js App Router dashboard for administering marketplace operations. It contains sign-in and password-reset screens, dashboard routes for analytics, products/content, orders, payments, users, notifications, and settings, reusable React components, TypeScript data models, and a credential-free demo mode.

Keep the data/auth boundaries clear:

1. **Supabase Auth** authenticates email/password and supplies an `app_metadata.role`. `lib/auth.ts` requires this role to be `admin`.
2. **Supabase PostgreSQL** is described by `supabase/schema.sql`. The schema creates profiles, products, orders, and order items, including grants and row-level security policies.
3. **The legacy marketplace API** is called by `lib/apiclient.ts` and feature API modules. Configure `NEXT_PUBLIC_API_URL` for screens that use those endpoints. Supabase Auth by itself does not provide these API endpoints.
4. **Demo mode** is a separate browser-local experience. It uses `localStorage` sample records and is not a live account or live marketplace database.

Do not present the SQL schema as if every dashboard screen is already backed by it. For each screen, trace its data source before claiming it is connected to production data.

## How to study and reproduce the code

For every module below:

1. Read the named files and draw the data/control flow before coding.
2. Re-create the smallest working version in a scratch branch or separate practice folder.
3. Run `npm run lint` and `npm run build` after completing a vertical slice.
4. Test the error, empty, loading, and success states—not just the happy path.
5. Explain the choices out loud as if the interviewer were a student.
6. Return to the repository and compare your implementation with the actual code. Record what differs and why.

Do not copy `.env.local`, real user data, or credentials into notes, source code, screenshots, or commits.

## Scheme of work

| Module | Topics and files | Practice outcome |
|---|---|---|
| 1. Repository and toolchain | `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `components.json`, `.gitignore`, `.env.example` | Explain the scripts, dependencies, aliases, build configuration, CSS pipeline, and environment-variable convention. Start the app locally and run lint/build. |
| 2. App Router and page shells | `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/(auth)/*`, `app/(dashboard)/*`, `app/inbox/page.tsx` | Draw the route tree. Explain route groups, the root layout, page components, navigation, and the sign-in redirect. |
| 3. Design system and UI primitives | `components/ui/*`, `components.json`, `components/auth-layout.tsx`, `components/inner-layout.tsx`, `components/input-container.tsx`, `components/misc.tsx`, `hooks/use-mobile.ts`, `public/fonts/*`, `public/images/*`, `app/nanzy logo.jpg` | Recreate a button, input, dialog, responsive sidebar, and one auth screen. Explain composition, props, accessibility, responsive design, and theme tokens. |
| 4. Dashboard shell and navigation | `app/(dashboard)/layout.tsx`, `components/Headers.tsx`, `components/app-sidebar.tsx`, `components/nav-main.tsx`, `components/nav-user.tsx`, `components/team-switcher.tsx`, `components/demo-mode-notice.tsx` | Build the protected application frame with header, sidebar, route navigation, and demo notice. Explain where shared UI belongs versus page-specific UI. |
| 5. Forms and validation | `lib/schema.ts`, `components/input-container.tsx`, `app/(auth)/sign-in/page.tsx`, `app/(auth)/forgot-password/page.tsx`, `components/reset-password.tsx` | Implement typed forms, schema validation, field errors, loading state, success/failure feedback, and password visibility. Explain why validation exists in both UI and trusted services. |
| 6. Authentication and account lifecycle | `lib/supabase.ts`, `lib/auth.ts`, `components/protected-route.tsx`, `components/settings/Logout.tsx`, `app/admin/reset-password/page.tsx`, `app/(auth)/reset-password/page.tsx` | Trace sign-in, admin-role check, recovery redirect, password update, sign-out, and protected-page rendering. Explain that a client-side route guard improves UX but is not a substitute for server/database authorization. |
| 7. Database and authorization | `supabase/schema.sql`, `types/user.ts`, `types/product.ts`, `types/order.ts`, `types/payout.ts`, `types/collection.ts`, `types/experience.ts` | Draw the profile/product/order/order-item relationships. Explain primary/foreign keys, checks, indexes, trigger, grants, JWT `app_metadata`, RLS `USING` versus `WITH CHECK`, and how to test policies as anon, seller, customer, and admin. |
| 8. Data clients and API boundaries | `lib/apiclient.ts`, `app/api/[...path]/route.ts`, `lib/products-api.ts`, `lib/collections-api.ts`, `lib/experiences-api.ts`, `lib/notifications-api.ts`, `lib/analytics.ts`, `lib/csv.ts` | Trace a feature request from page to client to endpoint and back. Explain the proxy, request/response types, query parameters, token refresh behavior, HTTP error handling, and why external data must not be confused with Supabase tables. |
| 9. Demo data and client state | `lib/demo-mode.ts`, `lib/demo-*.ts`, `components/dashboard/public-api-demo.tsx`, `components/analytics/demo-analytics-dashboard.tsx` | Rebuild demo entry, sample/empty data mode, browser persistence, notifications, and a safe demo mutation. Explain `localStorage` limitations and why demo data is neither private nor production data. |
| 10. Operational dashboard pages | `app/(dashboard)/dashboard/page.tsx`, `components/dashboard/*`, `components/analytics/*`, `app/(dashboard)/analytics/page.tsx`, `app/inbox/page.tsx`, `components/inbox.tsx` | Recreate dashboard cards, performance summary, activity/content/seller widgets, analytics visualization, and inbox. Explain loading, empty, error, and demo/live states. |
| 11. Marketplace CRUD screens | `app/(dashboard)/product-management/page.tsx`, `components/products/*`, `app/(dashboard)/content-management/page.tsx`, `components/collections/*`, `app/(dashboard)/orders/page.tsx`, `components/orders/*`, `app/(dashboard)/user-management/page.tsx`, `components/users/*` | Implement a table + detail modal + form/delete flow for one resource, then repeat the pattern for the others. Explain controlled state, typed records, pagination/search if present, confirmation, and mutation/error feedback. |
| 12. Payments, notifications, settings | `app/(dashboard)/payment/page.tsx`, `components/payment/*`, `components/notifications/*`, `app/(dashboard)/settings/page.tsx`, `components/settings/*`, `components/invite-admin.tsx` | Recreate transaction/payout views, notification preferences/workspace, account settings, roles/admin list, and logout UI. Identify which operations are implemented, demo-only, or require a trusted backend service. |
| 13. Security and production readiness | Review Modules 6–12, `.env.example`, `supabase/schema.sql`, `app/api/[...path]/route.ts`, `Dockerfile`, `.github/workflows/staging-ci.yml` | Threat-model roles, secrets, browser storage, API proxying, RLS, redirects, and build-time settings. Write tests/checklists for unauthorized access, invalid input, and failed network requests. |
| 14. Deployment and interview rehearsal | `README.md`, `Dockerfile`, `.github/workflows/staging-ci.yml`, Vercel project settings (external configuration) | Explain the difference between a deployment build and runtime configuration, verify a deployment, and describe why the `dev` branch currently deploys to Production. Present the project in a two-minute walkthrough. |

## File-by-file learning map

Use the scheme above as the build sequence. This inventory is a checklist so you can mark files understood as you reproduce each layer.

### Routes and app shell

- Root: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/inbox/page.tsx`, `app/admin/reset-password/page.tsx`.
- Auth routes: `app/(auth)/sign-in/page.tsx`, `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`.
- Dashboard routes: `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/analytics/page.tsx`, `app/(dashboard)/content-management/page.tsx`, `app/(dashboard)/orders/page.tsx`, `app/(dashboard)/payment/page.tsx`, `app/(dashboard)/product-management/page.tsx`, `app/(dashboard)/settings/page.tsx`, `app/(dashboard)/user-management/page.tsx`.
- API route: `app/api/[...path]/route.ts`.

### Shared application components

- Shell and navigation: `components/Headers.tsx`, `components/app-sidebar.tsx`, `components/nav-main.tsx`, `components/nav-user.tsx`, `components/team-switcher.tsx`, `components/inner-layout.tsx`, `components/demo-mode-notice.tsx`, `components/protected-route.tsx`.
- Auth and forms: `components/auth-layout.tsx`, `components/input-container.tsx`, `components/reset-password.tsx`, `components/invite-admin.tsx`.
- Dashboard widgets: `components/dashboard/card-container.tsx`, `components/dashboard/contents.tsx`, `components/dashboard/orders-card.tsx`, `components/dashboard/performance-card.tsx`, `components/dashboard/public-api-demo.tsx`, `components/dashboard/sellers.tsx`.
- Analytics: `components/analytics/analytics-dashboard.tsx`, `components/analytics/demo-analytics-dashboard.tsx`.
- Inbox: `components/inbox.tsx`.
- Content/collections: `components/collections/content-detail-modal.tsx`, `components/collections/content-table.tsx`.
- Orders: `components/orders/orders-details-modal.tsx`, `components/orders/orders-table.tsx`.
- Payments: `components/payment/payment-table.tsx`, `components/payment/payout-request-modal.tsx`, `components/payment/transaction-detail-modal.tsx`.
- Products, collections, and experiences: `components/products/collection-detail-modal.tsx`, `components/products/collections-table.tsx`, `components/products/delete-collection-dialog.tsx`, `components/products/delete-experience-dialog.tsx`, `components/products/delete-product-dialog.tsx`, `components/products/experience-detail-modal.tsx`, `components/products/experience-table.tsx`, `components/products/product-detail-modal.tsx`, `components/products/product-form-modal.tsx`, `components/products/products-table.tsx`.
- Users: `components/users/delete-user-dialog.tsx`, `components/users/user-form-modal.tsx`, `components/users/user-profile-modal.tsx`, `components/users/users-table.tsx`.
- Notifications: `components/notifications/notifications-workspace.tsx`.
- Settings: `components/settings/Account.tsx`, `components/settings/Logout.tsx`, `components/settings/Notifications.tsx`, `components/settings/User-roles.tsx`, `components/settings/admins-table.tsx`.
- Shared primitives: `components/ui/avatar.tsx`, `button.tsx`, `calendar.tsx`, `data-table.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input-group.tsx`, `input.tsx`, `label.tsx`, `popover.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `tabs.tsx`, `textarea.tsx`, `tooltip.tsx`. These paths are all under `components/ui/`.
- Other shared code: `components/misc.tsx`, `hooks/use-mobile.ts`.

### Data, types, and database

- Service modules: `lib/analytics.ts`, `lib/apiclient.ts`, `lib/auth.ts`, `lib/collections-api.ts`, `lib/csv.ts`, `lib/demo-mode.ts`, `lib/demo-notifications.ts`, `lib/demo-orders.ts`, `lib/demo-payments.ts`, `lib/demo-products.ts`, `lib/demo-users.ts`, `lib/experiences-api.ts`, `lib/notifications-api.ts`, `lib/products-api.ts`, `lib/schema.ts`, `lib/supabase.ts`, `lib/utils.ts`.
- Type definitions: `types/collection.ts`, `types/experience.ts`, `types/order.ts`, `types/payout.ts`, `types/product.ts`, `types/user.ts`.
- SQL: `supabase/schema.sql`.

### Configuration, deployment, and static assets

- Configuration: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `components.json`, `.gitignore`, `.env.example`.
- Deployment: `Dockerfile`, `.github/workflows/staging-ci.yml`.
- Branding/fonts: `app/nanzy logo.jpg`, `public/fonts/*`.
- Image assets: `public/images/box-diagonal-arrow.svg`, `box-trend.svg`, `content-icon.svg`, `content-image.png`, `content-non-active-icon.svg`, `denim.png`, `failedPaymenticon.svg`, `logout.svg`, `nanzy-logo.jpg`, `pearly logo.png`, `processedpayoutIcon.svg`, `seller-mini.png`, `shopping-cart.svg`, `successTick.svg`, `teal-box-package.svg`, `teal-box-time.svg`, `totalpaymenticon.svg`, `user-avatar.svg`.

Static assets are loaded by UI rather than having business logic. Learn how they are referenced and optimized; do not spend time manually recreating font binary files.

## A vertical slice to build first

Before attempting every dashboard page, build one complete **products** slice:

1. Define the product shape in `types/product.ts`.
2. Build a typed API method in `lib/products-api.ts`.
3. Build a table in `components/products/products-table.tsx`.
4. Add loading, empty, and error states to the table/page.
5. Add a detail view and form modal; validate form input.
6. Add update/delete confirmation and show mutation feedback.
7. Decide whether the data is live API-backed or demo-only; label it correctly.
8. Test authorization at the API/database boundary, not only by hiding a button.

After that works, reuse the same reasoning—not necessarily the same implementation—for orders, users, notifications, and payments.

## Security and design questions to be ready for

- **Where is authorization enforced?** `ProtectedRoute` checks the admin role in the browser to control access to dashboard UI. A browser check can be bypassed, so every sensitive API and every database table also needs server-side authorization or correctly tested RLS.
- **What makes an account an admin?** `lib/auth.ts` checks `user.app_metadata.role === "admin"`. `app_metadata` is trusted metadata managed by an administrator, unlike user-editable metadata. Existing sessions may need refreshing after a role change.
- **What may be public?** The Supabase URL and anon key are client configuration, not secret credentials. They must be protected by RLS and least-privilege grants. Never expose a Supabase service-role key in frontend code or `NEXT_PUBLIC_*`.
- **What does RLS protect?** It constrains rows for requests made with user tokens. Read every policy as an authorization rule, check policy combinations, and test all roles. A table grant alone is not a row-level permission.
- **Is the marketplace database live in every screen?** No. Trace each screen to its API module, demo adapter, or Supabase call. `NEXT_PUBLIC_API_URL` is required for the legacy API screens; configuring Supabase Auth does not create that backend.
- **Is demo mode an authentication system?** No. Its session flag is in browser `localStorage`, so it is intended only for a clearly labeled demo. It must never grant real data access.
- **What belongs on the server?** Service-role credentials, privileged user-management/invite operations, and any action requiring trusted authorization belong in a protected server-side service. The app explicitly directs admin invitation management to Supabase rather than exposing a service key.
- **What should be validated?** Validate shape and business constraints at the boundary, handle network/auth failures visibly, and avoid treating failed requests as successful empty results.
- **How do reset links work?** The app uses `NEXT_PUBLIC_SITE_URL` (or the current origin fallback) to form the `/reset-password` redirect. The Supabase Auth URL allowlist must include the deployed reset URL.

Treat this section as a learning and verification checklist, not a claim that every edge case has already been security-audited.

## Interview teaching script

Practice this explanation, then support every statement by navigating to the actual code:

> “This is a marketplace administration dashboard built with Next.js App Router, React, and TypeScript. The root layout provides global fonts and theme styles, while route groups separate authentication pages from the protected dashboard shell. The shell composes navigation, header, and page content from reusable components. I keep API calls, auth behavior, validation schemas, domain types, and demo data in separate modules so pages focus on UI and interaction. Supabase Auth handles sign-in and the admin role; Supabase PostgreSQL has a relational schema protected by grants and RLS. The legacy marketplace endpoints are a separate integration, and demo mode uses browser-local sample data, so I verify each screen's actual data source rather than claiming all records come from Supabase. On deployment, Vercel builds the connected Git branch; here `dev` is configured as Production, so successful pushes to it can publish live. For security, client-side route protection is only a UI layer—the real boundary must be enforced by backend authorization and database policies.”

Then teach one concrete flow, for example: **sign-in page → `adminAuthApi.login` → Supabase `signInWithPassword` → inspect trusted admin role → redirect to dashboard → `ProtectedRoute` checks access → database RLS limits data**. Call out where the UI check ends and server/database enforcement must begin.

## Self-assessment: ready for the interview when you can

- Rebuild one route without copying it, including its types, data flow, state, and errors.
- Explain the difference between a route group, page, layout, reusable component, hook, service module, and type definition.
- Draw the Auth → role → protected UI flow and the independent API/database authorization flow.
- Explain the schema's relationships, integrity constraints, trigger, grants, and RLS policies.
- Demonstrate demo mode and explain exactly what is stored in the browser.
- Explain how environment variables differ from committed configuration, and why public client keys still require RLS.
- Trace a production deployment from a Git push through a successful Vercel build to the live domain.
- Name at least one trade-off, one current integration boundary, one failure mode, and one next improvement without overstating what the app currently does.

## Suggested study cadence

Plan for 14 focused sessions (one module per session). If a module needs more time, split it; do not skip the tests or explanation practice. At the end of each session write a short private note: **what I rebuilt, how the data flows, how it fails, and how I would explain it to a beginner**. Keep secrets, real user data, and private project values out of those notes.
