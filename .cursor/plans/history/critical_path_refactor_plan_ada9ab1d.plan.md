---
name: Critical Path Refactor Plan
overview: Refactor critical-path auth, webhook, and data-access flows first to improve DRYness, type safety, error handling, and separation of concerns without changing behavior; then roll the same standards across remaining modules in controlled phases.
todos:
  - id: baseline-audit
    content: Create a per-file baseline checklist for critical-path files and function inventory for full JSDoc coverage.
    status: pending
  - id: shared-helpers
    content: Introduce and apply shared typed error/guard utilities to remove repetitive unsafe patterns.
    status: pending
  - id: refactor-critical-files
    content: Refactor webhook, auth, profile settings, sso callback, and home data-boundary files in non-breaking sequence.
    status: pending
  - id: docs-pass
    content: Add comprehensive JSDoc annotations before every function in each scoped file.
    status: pending
  - id: verify
    content: Run lint/type checks and targeted flow validations after each phase, then report changes block-by-block.
    status: pending
isProject: false
---

# Production Refactor & Documentation Plan

## Objectives

- Preserve current behavior while improving maintainability and reliability.
- Enforce strict typing and remove unsafe patterns (`any`, broad casts, implicit complex return contracts).
- Separate data-mutation/database logic from UI concerns where currently mixed.
- Add comprehensive JSDoc before every function in scoped files for each phase.

## Phase 1: Critical Path (First Pass)

### 1) Introduce shared safe helpers (non-breaking foundation)

- Add typed error-normalization and guard helpers in shared utilities (`lib/`) and reuse them in auth/webhook/data files.
- Keep output messages equivalent to current UX/API behavior.

Primary files to leverage/update:

- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/lib/utils.ts](/Users/pengfeitian/Documents/Projects/conneco-right-demo/lib/utils.ts)`
- New focused helper modules in `lib/` only if needed (small, single-purpose).

### 2) Harden webhook server endpoint types and error boundaries

- Refactor webhook handler and helper functions with explicit param/return types and narrowed payload parsing.
- Wrap external integration boundaries (Svix verification, Supabase writes) in explicit try/catch sections with clear error mapping.
- Keep response status behavior unchanged.

Target file:

- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/api/webhooks/clerk/route.ts](/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/api/webhooks/clerk/route.ts)`

### 3) Split auth/account side effects from dense UI orchestration

- Extract repetitive account-mutation logic from large profile settings UI into reusable typed helpers/hooks (client-side orchestration only).
- Retain current UI rendering and user flows while reducing handler complexity.

Target file(s):

- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/settings.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/settings.tsx)`
- Potential supporting extraction under `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/)`

### 4) Refactor SSO callback flow into typed decision helpers

- Isolate branching/auth-finalization logic into small typed functions to reduce nested control flow.
- Add robust top-level error handling for async callback flow and keep redirect outcomes equivalent.

Target file:

- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/sso-callback/page.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/sso-callback/page.tsx)`

### 5) Standardize sign-in/sign-up logic via shared auth utilities

- Remove repetitive error parsing, redirect handling, and status branching through shared utility/hook usage.
- Add explicit return types to event handlers and API-interaction functions.

Target files:

- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/auth/custom-sign-in-form.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/auth/custom-sign-in-form.tsx)`
- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/auth/custom-sign-up-form.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/auth/custom-sign-up-form.tsx)`
- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/auth/social-auth-buttons.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/auth/social-auth-buttons.tsx)`

### 6) Separate demo/home UI from direct DB operations

- Move Supabase operation logic from page component-level handlers into reusable typed server/data helpers where applicable while preserving displayed behavior.
- Replace weak state typing with explicit row interfaces.

Target file:

- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/page.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/page.tsx)`

## Phase 2: Repo-Wide Expansion

- Apply the same standards to remaining components/routes in priority order:
  - profile feature modules
  - admin feature modules
  - shared UI shell/navigation modules
- Continue non-breaking extractions for repeated patterns (navigation config, shared display blocks, handler wrappers).

Likely follow-up files:

- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/sidebar.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/sidebar.tsx)`
- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/mobile-nav.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/profile/mobile-nav.tsx)`
- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/header.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/components/header.tsx)`
- `[/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/admin/page.tsx](/Users/pengfeitian/Documents/Projects/conneco-right-demo/app/admin/page.tsx)`

## JSDoc Standard to Apply (every function in scoped files)

For each function, include:

- `@description`
- `@param` for every parameter
- `@returns`
- `@throws` (explicitly state possible runtime/integration errors; for UI handlers, document thrown dependency errors if propagated)

## Execution Flow Diagram

```mermaid
flowchart TD
  audit[AuditCriticalPathFiles] --> shared[AddSharedTypedHelpers]
  shared --> webhook[RefactorWebhookRoute]
  shared --> authForms[RefactorAuthForms]
  shared --> sso[RefactorSsoCallback]
  shared --> profile[RefactorProfileSettings]
  shared --> home[RefactorHomeDataBoundary]
  webhook --> validate[RunTypeAndLintValidation]
  authForms --> validate
  sso --> validate
  profile --> validate
  home --> validate
  validate --> phase2[ExpandToRemainingModules]
```



## Validation & Safety Checks

- Run lint/TypeScript checks after each file group.
- Verify auth flows manually: email/password sign-in, sign-up verification, OAuth callback.
- Verify webhook behavior with test payloads/non-prod checks.
- Confirm no visible functional regressions in profile/admin/home flows.

## Deliverables Format During Execution

- Refactored code presented block-by-block per file group.
- For each block: what changed, why it is safer/scalable, and confirmation of preserved behavior.

