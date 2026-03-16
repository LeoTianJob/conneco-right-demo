# Conneco Right — Project Manual

This document explains what has been implemented in this project, the key technologies used, and how to run and understand the codebase. It is written for maintainers who did not write the original code.

---

## 1. How to Run the Project

### 1.1 Prerequisites

- **Node.js** (v20+ recommended)
- **pnpm** (or npm/yarn)
- **Supabase CLI** (for local Supabase): `pnpm add -g supabase` or [install](https://supabase.com/docs/guides/cli)
- **Clerk account** and **Supabase project** (local and/or hosted)
- **ngrok** (optional, for receiving Clerk webhooks locally): `brew install ngrok` or [ngrok.com](https://ngrok.com)

### 1.2 Environment Variables

Copy the appropriate env file and fill in secrets (never commit real secrets):

| File | Purpose |
|------|--------|
| `.env.local` | Local development (Next.js + local Supabase) |
| `.env.dev` | Development against **hosted** Supabase (e.g. dev project) |
| `.env.production` | Production build (hosted Supabase + production Clerk) |

**Required variables (see `.env.local` / `.env.dev` for names):**

- **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, client key (`NEXT_PUBLIC_SUPABASE_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), `SUPABASE_SERVICE_ROLE_KEY` (server-only, for webhooks)

Ensure the client-side Supabase key name matches what the app uses (e.g. `app/page.tsx` uses `NEXT_PUBLIC_SUPABASE_KEY`).

### 1.3 Run Locally

**Option A — Local Supabase (database on your machine)**

1. Start Supabase (from project root):
   ```bash
   supabase start
   ```
2. Apply migrations:
   ```bash
   supabase db reset
   # or only apply: supabase migration up
   ```
3. Get local API URL and keys: `supabase status` (use the API URL and anon/service keys in `.env.local`).
4. Start Next.js with local env:
   ```bash
   pnpm install
   pnpm dev:local
   ```
5. Open [http://localhost:3000](http://localhost:3000).

**Option B — Hosted Supabase (e.g. dev project)**

1. Use `.env.dev` (or point `.env.local` to your hosted Supabase URL and keys).
2. Run:
   ```bash
   pnpm install
   pnpm dev:dev
   # or: dotenv -e .env.dev -- next dev
   ```
3. Open [http://localhost:3000](http://localhost:3000).

**Clerk webhooks (user sync to Supabase) when running locally**

- Clerk cannot POST to `localhost`. Use ngrok so Clerk can reach your app.
- See **[docs/ngrok-webhooks.md](./ngrok-webhooks.md)** for: installing ngrok, running `pnpm tunnel` (or `ngrok http 3000`), and configuring the Clerk webhook URL and `CLERK_WEBHOOK_SECRET`.

### 1.4 Run Remotely (deployed)

1. **Build** with production env:
   ```bash
   pnpm build:prod
   # or: dotenv -e .env.production -- next build
   ```
2. **Start** (e.g. on a Node server):
   ```bash
   pnpm start
   ```
3. In your hosting platform (Vercel, etc.):
   - Set all required env vars (Clerk + Supabase).
   - Set the **Clerk webhook** URL to `https://<your-domain>/api/webhooks/clerk` and subscribe to `user.created` and `user.updated`; put the signing secret in `CLERK_WEBHOOK_SECRET`.

---

## 2. Project Structure (with comments)

```
conneco-right-demo/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx                # Root layout: ClerkProvider, fonts (Inter, JetBrains Mono, Playfair), Header/Footer
│   ├── page.tsx                  # Home: Clerk + Supabase demo (tasks), Hero/Features/Pricing
│   ├── globals.css               # Tailwind 4 theme, @theme inline, semantic tokens (e.g. bg-background, text-accent)
│   ├── about/page.tsx            # About page
│   ├── admin/
│   │   ├── layout.tsx            # Admin layout
│   │   └── page.tsx              # Admin dashboard (School Admin / System Admin)
│   ├── profile/
│   │   ├── layout.tsx            # Profile layout
│   │   └── page.tsx              # User profile (protected)
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx              # Custom sign-in (CustomSignInForm)
│   ├── sign-up/[[...sign-up]]/
│   │   └── page.tsx              # Clerk SignUp with AuthLayout
│   ├── sso-callback/page.tsx     # OAuth redirect handler after Google/Apple sign-in
│   └── api/
│       └── webhooks/
│           └── clerk/
│               └── route.ts      # Clerk webhook: verify Svix signature, sync user → Supabase profiles
├── components/
│   ├── auth/
│   │   ├── custom-sign-in-form.tsx   # Personal/Institution tabs, password + OAuth (useSignIn)
│   │   └── social-auth-buttons.tsx   # Google/Apple OAuth buttons
│   ├── auth-layout.tsx           # Two-column auth shell (form left, quote carousel right)
│   ├── admin/                    # Admin dashboard widgets (e.g. stats, charts, tables)
│   ├── profile/                  # Profile sections, sidebar, settings, asset gallery, etc.
│   ├── header.tsx
│   ├── footer.tsx
│   ├── hero.tsx
│   ├── features.tsx
│   ├── pricing.tsx
│   ├── cta.tsx
│   └── app-shell.tsx
├── lib/
│   └── utils.ts                  # cn() (clsx + tailwind-merge) for classNames
├── public/                       # Static assets (images, SVGs)
├── supabase/
│   ├── config.toml               # Local Supabase config (ports, auth, API, etc.)
│   ├── migrations/
│   │   └── 20250312000000_clerk_profiles_institutions.sql   # profiles, institution, profile_institutions, RLS
│   └── snippets/                 # Ad-hoc SQL (e.g. queries)
├── docs/
│   ├── ngrok-webhooks.md         # How to expose local app for Clerk webhooks
│   └── PROJECT_MANUAL.md         # This file
├── proxy.ts                      # Clerk route protection (clerkMiddleware); rename to middleware.ts for Next.js to run it
├── next.config.ts                # Next config (e.g. images.remotePatterns for Clerk)
├── package.json                  # Scripts: dev, dev:local, dev:dev, dev:prod, tunnel, build, build:prod, start
├── tsconfig.json
├── postcss.config.mjs
├── .cursorrules                  # Project rules for AI (stack, patterns, env)
├── .env.local                    # Local env (not committed)
├── .env.dev                      # Dev env (hosted Supabase)
└── .env.production               # Production env
```

**Note:** Next.js runs middleware only from a file named `middleware.ts` (or `middleware.js`) at the project root. The logic in `proxy.ts` is the Clerk middleware; to protect routes you must have that logic in `middleware.ts` (e.g. copy contents into `middleware.ts` or rename).

---

## 3. How Clerk and Supabase Work Together

Clerk handles **authentication** (sign-in, sign-up, sessions, OAuth). Supabase is the **database** (and optional auth partner). They are connected in two ways: **webhooks** (Clerk → your app → Supabase) and **session tokens** (browser → Supabase with Clerk identity).

### 3.1 Flow Overview

1. **User signs in** → Clerk creates/updates the user and session.
2. **Clerk → your app (webhook):** Clerk sends `user.created` / `user.updated` to your endpoint. Your app verifies the request and writes to Supabase `profiles`.
3. **Browser → Supabase (data):** The frontend (or server) creates a Supabase client that sends the **Clerk session token** as the access token. Supabase validates it and uses it for RLS (e.g. by `sub` = Clerk user ID).

So: **Clerk is the source of truth for identity**; **Supabase stores profile data and app data**, with RLS so each user only sees their own rows where applicable.

### 3.2 Code: Clerk → Supabase via Webhook

**File:** `app/api/webhooks/clerk/route.ts`

- Clerk POSTs to `/api/webhooks/clerk` with Svix headers (`svix-id`, `svix-timestamp`, `svix-signature`).
- The route verifies the body with `CLERK_WEBHOOK_SECRET` using the **svix** library.
- On `user.created` or `user.updated`, it:
  - Resolves primary email and `user_type` from `public_metadata`.
  - Creates a **Supabase client with the service role key** (bypasses RLS) and upserts into `profiles` (id = Clerk user ID, email, first_name, last_name, user_type, updated_at).

So **Clerk communicates with Supabase only indirectly**: Clerk → your webhook → Supabase. The webhook is the only place that writes user profile data from Clerk into Supabase.

### 3.3 Code: Browser/App → Supabase with Clerk Token

**File:** `app/page.tsx` (client)

- Uses `useSession()` from Clerk to get `session` and `session.getToken()`.
- Builds a Supabase client with `createClient(SUPABASE_URL, SUPABASE_KEY, { accessToken: () => session?.getToken() ?? null })`.
- All Supabase requests then send the Clerk session token. Supabase (when configured for Clerk as a third-party auth provider) treats it as a valid JWT and uses it for RLS.

So **the app talks to Supabase with the Clerk session token** so that RLS policies can use the same identity (e.g. `sub` = Clerk user ID).

### 3.4 Database: RLS and Clerk User ID

**File:** `supabase/migrations/20250312000000_clerk_profiles_institutions.sql`

- Defines `requesting_user_id()` which reads `current_setting('request.jwt.claims', true)::json->>'sub'` — i.e. the Clerk user ID from the JWT.
- RLS on `profiles`: users can SELECT and UPDATE only where `requesting_user_id() = id` (id is the Clerk user ID).
- So **Supabase trusts the JWT’s `sub`** (set by Clerk when using the recommended third-party integration) to enforce “own row only” access.

**Summary:** Clerk and Supabase work together by (1) syncing users into Supabase via your webhook, and (2) sending the Clerk session token to Supabase on every request so RLS can restrict access by that same user ID.

---

## 4. Official Documentation Used

These are the main Clerk and Supabase docs that align with how this project is built:

- **Clerk**
  - [Integrate Supabase with Clerk (Clerk Docs)](https://clerk.com/docs/guides/development/integrations/databases/supabase) — Supabase client with `session.getToken()`, RLS, no JWT template.
  - [Clerk Webhooks](https://clerk.com/docs/guides/development/webhooks/overview) — Webhook events and signing (Svix).
  - [Next.js SDK (Clerk)](https://clerk.com/docs/reference/nextjs/overview) — `ClerkProvider`, `useSignIn`, `useSession`, `useUser`, `auth().getToken()`.
  - [Session tokens](https://clerk.com/docs/backend-requests/resources/session-tokens) — Claims (e.g. `sub`, `role`) used by Supabase.
- **Supabase**
  - [Clerk as third-party auth (Supabase Docs)](https://supabase.com/docs/guides/auth/third-party/clerk) — Configure Clerk in Supabase, use Clerk session token with Supabase client.
  - [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) — Policies and `auth.jwt()` / JWT claims.
  - [Supabase JS client](https://supabase.com/docs/reference/javascript/initializing) — `createClient` with custom `accessToken`.
- **Next.js**
  - [App Router](https://nextjs.org/docs/app), [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware).

The project uses the **recommended** approach: Clerk as Supabase third-party auth and session token as access token. The older “JWT template” approach (Clerk issuing a Supabase-shaped JWT) is deprecated in the docs above.

---

## 5. Database Structure and Migrations

### 5.1 Schema (from migration)

- **`requesting_user_id()`**  
  - Returns `sub` from `request.jwt.claims` (Clerk user ID). Used in RLS.

- **`institution`**  
  - `id` (uuid, PK), `name`, `institution_type`, `attributes` (jsonb), `created_at`.

- **`profiles`**  
  - `id` (text, PK) = **Clerk user ID**.  
  - `email`, `first_name`, `last_name`, `user_type` (default `'individual'`), `institution_id` (FK), `attributes` (jsonb), `created_at`, `updated_at`.  
  - Trigger: `profiles_updated_at` sets `updated_at` on UPDATE.

- **`profile_institutions`**  
  - Many-to-many: `profile_id` (→ profiles.id), `institution_id` (→ institution.id), `created_at`.  
  - PK (`profile_id`, `institution_id`).

**RLS (summary):**

- **profiles:** SELECT and UPDATE only where `requesting_user_id() = id`.
- **institution:** SELECT for authenticated; writes typically via service role.
- **profile_institutions:** SELECT/INSERT/DELETE only where `requesting_user_id() = profile_id`.

### 5.2 Migrating Data: Local → Hosted (e.g. Web)

1. **Export from local** (Supabase CLI):
   ```bash
   supabase db dump -f local_dump.sql
   ```
   Or use `pg_dump` against local DB (see `supabase status` for connection string).

2. **Apply migrations on hosted project** (if not already):
   - In Supabase Dashboard → SQL Editor, run the contents of `supabase/migrations/20250312000000_clerk_profiles_institutions.sql`, or
   - Use Supabase CLI linked to the remote project and run `supabase db push` (or run migrations manually).

3. **Import data (optional):**
   - Clean the dump if needed (e.g. remove conflicting IDs, adjust sequences).
   - Run the SQL in the hosted project’s SQL Editor, or use `psql` with the hosted DB URL.

4. **Secrets:** Ensure the **hosted** project has the same RLS and that the app uses the hosted `NEXT_PUBLIC_SUPABASE_URL` and keys. Clerk webhook must point to the deployed app and use the same `profiles` shape.

For **schema-only** sync, running the migration file on the hosted project is enough; for **data** sync, use dump/restore or scripted inserts and respect RLS and foreign keys.

---

## 6. Other Technical Points

- **Tailwind 4:** Theme is in `app/globals.css` (`@theme inline`). Use semantic tokens (e.g. `bg-background`, `text-accent`) and `cn()` from `lib/utils` for class names. No `tailwind.config.js`.
- **Next.js 16:** `params` and `searchParams` in pages/layouts are Promises; use `await` in Server Components. Use Server Actions for mutations; return `{ success, data?, error? }`.
- **Clerk middleware:** Route protection is implemented in `proxy.ts`. For Next.js to run it, the same logic must live in `middleware.ts` at the project root. Public routes: `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks/clerk`.
- **Env per environment:** `dev:local` / `dev:dev` / `dev:prod` use different env files via `dotenv -e`. Use the correct file for local vs hosted Supabase and for production builds.
- **Service role key:** Used only in the webhook route to upsert `profiles`. Never expose it to the client; it bypasses RLS.
- **TypeScript:** No `any`; use explicit prop types and structured Server Action return types. No `@ts-ignore`; fix types or document narrow casts.

---

*End of manual.*
