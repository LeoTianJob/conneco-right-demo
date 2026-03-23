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

    // 1. Upsert profile
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: evt.data.id,
        email,
        first_name: evt.data.first_name ?? null,
        last_name: evt.data.last_name ?? null,
        image_url: evt.data.image_url ?? null,
        user_type: getUserType(evt.data),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

    if (profileError) {
      console.error('[webhooks/clerk] Profile upsert failed:', profileError)
      return NextResponse.json({ received: true })
    }

    // 2. Sync linked social providers (replace strategy)
    // Clerk sends the complete external_accounts array on every event,
    // so we delete stale rows and insert the current set.
    const accounts = evt.data.external_accounts ?? []

    const { error: deleteError } = await supabase
      .from('user_identities')
      .delete()
      .eq('profile_id', evt.data.id)

    if (deleteError) {
      console.error('[webhooks/clerk] Failed to clear old identities:', deleteError)
    }

    if (accounts.length > 0) {
      const rows = accounts.map((acc) => ({
        id: acc.id,
        profile_id: evt.data.id,
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
