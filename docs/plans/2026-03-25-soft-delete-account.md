# Plan: Soft-delete accounts (email masking + Clerk removal)

**Date:** 2026-03-25  
**Goal:** Durable soft-delete that frees the unique `profiles.email` for future sign-ups while retaining audit data (`original_email`, `deleted_at`, `status`).

## 1. Database

- New migration adds to `profiles`:
  - `deleted_at timestamptz` (nullable)
  - `original_email text` (nullable)
  - `status text NOT NULL DEFAULT 'active'` with check constraint: `active` | `deleted` | `recovered`
- Existing rows backfill: `status = 'active'`, other new columns null.
- Masked value `deleted_${id}` stays unique under existing `profiles_email_unique`.

## 2. Server action `deleteUserAccount(userId)`

- File: `app/profile/actions.ts` (`'use server'`).
- `await auth()`: require signed-in user; `userId` must match session (no cross-user deletes).
- Supabase service-role client (env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) to read/update `profiles` after auth check.
- Load row; if missing or `status === 'deleted'`, return structured error.
- Update: `status = 'deleted'`, `original_email = current email`, `email = 'deleted_' || id`, `deleted_at = now()`.
- Call `(await clerkClient()).users.deleteUser(userId)`.
- On Clerk failure: revert profile row to previous email and clear soft-delete fields; return error.
- Return `{ success, error? }`; JSDoc includes required `@description` line.

## 3. Webhook `app/api/webhooks/clerk/route.ts`

- After verification, if `evt.type === 'user.deleted'`: structured `console.log` audit (clerk user id, timestamp); return 200. No DB write (primary state already set by the action).
- Keep existing `user.created` / `user.updated` sync unchanged (upsert does not send `status`, so soft-delete columns are not overwritten on normal sync).

## 4. UI — `components/profile/settings.tsx`

- Danger zone at the very bottom (below `CancelEditsFooter`): copy + red destructive button “Deactivate account”, confirmation step, pending state, call `deleteUserAccount(user.id)`, then `signOut({ redirectUrl: '/' })` on success.

## 5. Contact page (restore messaging only)

- New `app/contact/page.tsx` (Server Component): short note that deactivated accounts may request recovery via this contact channel; no restore implementation.
- `proxy.ts`: add `/contact(.*)` to public routes.
- `components/header.tsx`: point “Contact” nav to `/contact` (desktop + mobile).

## 6. Out of scope (explicit)

- `restoreUser` implementation (future).

## 7. Verification

- `pnpm exec eslint` on touched files; `pnpm exec tsc --noEmit` if available.

## 8. Clerk Dashboard

- Add the `user.deleted` event to the Clerk webhook endpoint (in addition to `user.created` / `user.updated`) so the audit log runs after each deletion.
