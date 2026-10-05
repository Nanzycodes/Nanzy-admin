# Nanzy Marketplace Admin

Nanzy is a Next.js admin dashboard for a buy-and-sell marketplace. It uses Supabase for optional hosted authentication and PostgreSQL data, and includes a credential-free demo mode for portfolio previews.



Open [http://localhost:3000](http://localhost:3000) and choose **Explore demo dashboard**. The dashboard has persistent sample-data and empty-state modes, plus a live, no-key read-only integration with JSONPlaceholder. Products, orders, users, payments, notifications, and analytics support demo workflows derived from browser-local records. Demo mode does not create an account or connect marketplace changes to a live backend.

## Configure Supabase

Supabase offers a free plan with hosted Auth and PostgreSQL; provider limits and terms can change. Create a Supabase project, then:

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the project’s API settings. These are public client credentials; never put a service-role key in this Next.js app.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
4. Create your first user in Supabase Auth.
5. Grant that user admin access from the SQL Editor, replacing the email:

   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'you@example.com';
   ```

6. Sign out and back in so Supabase issues a token with the new admin role.

Admin access is derived from Supabase `app_metadata`, which users cannot update themselves. Database access is guarded by row-level security (RLS). Review RLS policies before exposing real customer or order data.

## Scripts

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run build` — production build
