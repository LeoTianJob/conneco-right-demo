import { type NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// ── Clerk webhook payload types ──

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkExternalAccount {
  id: string
  provider: string
  provider_user_id?: string
  email_address?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface ClerkWebhookData {
  id: string
  email_addresses?: ClerkEmailAddress[]
  primary_email_address_id?: string | null
  first_name?: string | null
  last_name?: string | null
  image_url?: string | null
  external_accounts?: ClerkExternalAccount[]
  public_metadata?: Record<string, unknown>
}

interface ClerkWebhookPayload {
  type: string
  data: ClerkWebhookData
}

interface ProfileLookupRow {
  id: string
  status: string
}

// ── Helpers ──

/**
 * @description Validates whether an unknown payload matches the minimum Clerk webhook payload shape.
 * @param value Unknown value returned by Svix verification.
 * @returns True when payload contains `type` string and `data.id` string.
 * @throws Never throws.
 */
function isClerkWebhookPayload(value: unknown): value is ClerkWebhookPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as { type?: unknown; data?: { id?: unknown } }
  return typeof payload.type === 'string' && typeof payload.data?.id === 'string'
}

/**
 * @description Returns a primary email from Clerk data, prioritizing explicit primary email id.
 * @param data Clerk webhook data object.
 * @returns Resolved primary email or empty string if unavailable.
 * @throws Never throws.
 */
function getPrimaryEmail(data: ClerkWebhookData): string {
  const list = data.email_addresses ?? []
  const primaryId = data.primary_email_address_id
  if (primaryId) {
    const match = list.find((e) => e.id === primaryId)
    if (match?.email_address) return match.email_address
  }
  return list[0]?.email_address ?? ''
}

/**
 * @description Resolves `user_type` from Clerk public metadata with safe fallback.
 * @param data Clerk webhook data object.
 * @returns Metadata user type when present, otherwise `individual`.
 * @throws Never throws.
 */
function getUserType(data: ClerkWebhookData): string {
  const meta = data.public_metadata
  if (
    meta &&
    typeof meta === 'object' &&
    typeof (meta as Record<string, unknown>).user_type === 'string'
  ) {
    return (meta as Record<string, string>).user_type
  }
  return 'individual'
}

// ── Route handler ──

/**
 * @description Handles Clerk webhook events and synchronizes profile/identity records to Supabase.
 * @param request Next.js request carrying Svix signed webhook payload.
 * @returns JSON response acknowledging webhook receipt with resilient status handling.
 * @throws Never throws to caller; all runtime errors are handled and logged internally.
 */
export async function POST(request: NextRequest): Promise<Response> {
  if (!CLERK_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[webhooks/clerk] Missing env vars: CLERK_WEBHOOK_SECRET, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // ── Validate svix headers ──
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  let body: string
  try {
    body = await request.text()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // ── Verify webhook signature ──
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)
  let evt: ClerkWebhookPayload

  try {
    const verified = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
    if (!isClerkWebhookPayload(verified)) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }
    evt = verified
  } catch (err) {
    console.error('[webhooks/clerk] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (evt.type === 'user.deleted') {
    console.log('[webhooks/clerk] user.deleted audit (secondary confirmation)', {
      clerkUserId: evt.data.id,
      receivedAt: new Date().toISOString(),
      eventType: evt.type,
    })
    return NextResponse.json({ received: true })
  }

  if (evt.type !== 'user.created' && evt.type !== 'user.updated') {
    return NextResponse.json({ received: true })
  }

  // ── Sync to Supabase ──
  // Always return 200 to Clerk to prevent infinite retries.
  try {
    const email = getPrimaryEmail(evt.data)

    if (!email) {
      console.error('[webhooks/clerk] No primary email for user', evt.data.id)
      return NextResponse.json({ received: true })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const now = new Date().toISOString()
    const accounts = evt.data.external_accounts ?? []

    // 1) Always match by clerk_id first.
    const { data: existingByClerkId, error: existingByClerkIdError } = await supabase
      .from('profiles')
      .select('id, status')
      .eq('clerk_id', evt.data.id)
      .maybeSingle()

    if (existingByClerkIdError) {
      console.error('[webhooks/clerk] Failed to query profile by clerk_id:', existingByClerkIdError)
      return NextResponse.json({ received: true })
    }
    const existingProfile = existingByClerkId as ProfileLookupRow | null

    let profileUuid: string | null = null

    if (evt.type === 'user.created') {
        // 2a) New sign-up: if a deleted profile exists with the same email, reactivate that UUID row.
      if (!existingProfile) {
        const { data: deletedByEmail, error: deletedByEmailError } = await supabase
          .from('profiles')
          .select('id')
          .eq('status', 'deleted')
          .eq('email', email)
          .maybeSingle()

        if (deletedByEmailError) {
          console.error('[webhooks/clerk] Failed to query deleted profile by email:', deletedByEmailError)
          return NextResponse.json({ received: true })
        }

        const reactivationTarget = deletedByEmail as { id: string } | null
        if (reactivationTarget?.id) {
          const { data: reactivated, error: reactivateError } = await supabase
            .from('profiles')
            .update({
              clerk_id: evt.data.id,
              email,
              first_name: evt.data.first_name ?? null,
              last_name: evt.data.last_name ?? null,
              image_url: evt.data.image_url ?? null,
              user_type: getUserType(evt.data),
              status: 'active',
              deleted_at: null,
              scheduled_deletion_time: null,
              updated_at: now,
            })
            .eq('id', reactivationTarget.id)
            .select('id')
            .single()

          if (reactivateError || !reactivated?.id) {
            console.error('[webhooks/clerk] Reactivation update failed:', reactivateError)
            return NextResponse.json({ received: true })
          }
          profileUuid = reactivated.id
        }
      }

      // 2b) Normal create path: insert a fresh profile if no clerk/email match reactivation happened.
      if (!profileUuid) {
        if (existingProfile?.id) {
          const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update({
              email,
              first_name: evt.data.first_name ?? null,
              last_name: evt.data.last_name ?? null,
              image_url: evt.data.image_url ?? null,
              user_type: getUserType(evt.data),
              status: 'active',
              deleted_at: null,
              scheduled_deletion_time: null,
              updated_at: now,
            })
            .eq('id', existingProfile.id)
            .select('id')
            .single()

          if (updateError || !updated?.id) {
            console.error('[webhooks/clerk] Create sync update by clerk_id failed:', updateError)
            return NextResponse.json({ received: true })
          }
          profileUuid = updated.id
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('profiles')
            .insert({
              clerk_id: evt.data.id,
              email,
              first_name: evt.data.first_name ?? null,
              last_name: evt.data.last_name ?? null,
              image_url: evt.data.image_url ?? null,
              user_type: getUserType(evt.data),
              status: 'active',
              deleted_at: null,
              scheduled_deletion_time: null,
              updated_at: now,
            })
            .select('id')
            .single()

          if (insertError || !inserted?.id) {
            console.error('[webhooks/clerk] Create sync insert failed:', insertError)
            return NextResponse.json({ received: true })
          }
          profileUuid = inserted.id
        }
      }
    } else {
      // 3) user.updated: only sync when matched by clerk_id.
      if (!existingProfile?.id) {
        console.warn('[webhooks/clerk] user.updated ignored: no profile found for clerk_id', evt.data.id)
        return NextResponse.json({ received: true })
      }

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          email,
          first_name: evt.data.first_name ?? null,
          last_name: evt.data.last_name ?? null,
          image_url: evt.data.image_url ?? null,
          user_type: getUserType(evt.data),
          updated_at: now,
        })
        .eq('id', existingProfile.id)
        .select('id')
        .single()

      if (updateError || !updated?.id) {
        console.error('[webhooks/clerk] Update sync failed:', updateError)
        return NextResponse.json({ received: true })
      }
      profileUuid = updated.id
    }

    if (!profileUuid) {
      console.error('[webhooks/clerk] Missing profile UUID after sync flow', evt.data.id)
      return NextResponse.json({ received: true })
    }

    const { error: deleteError } = await supabase
      .from('user_identities')
      .delete()
      .eq('profile_id', profileUuid)

    if (deleteError) {
      console.error('[webhooks/clerk] Failed to clear old identities:', deleteError)
    }

    if (accounts.length > 0) {
      const rows = accounts.map((acc) => ({
        id: acc.id,
        profile_id: profileUuid,
        provider: acc.provider,
        provider_user_id: acc.provider_user_id ?? null,
        provider_email: acc.email_address ?? null,
        provider_avatar: acc.avatar_url ?? null,
      }))

      const { error: insertError } = await supabase
        .from('user_identities')
        .insert(rows)
      if (insertError) {
        console.error('[webhooks/clerk] Failed to insert identities:', insertError)
      }
    }

    console.log(
      '[webhooks/clerk] Synced profile + %d identities for %s (%s)',
      accounts.length,
      evt.data.id,
      evt.type,
    )
  } catch (err) {
    console.error('[webhooks/clerk] Unexpected error during sync:', err)
  }

  return NextResponse.json({ received: true })
}
