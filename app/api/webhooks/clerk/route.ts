import { type NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

// From .env.local: CLERK_WEBHOOK_SECRET (Clerk Dashboard → Webhooks → Signing secret), SUPABASE_SERVICE_ROLE_KEY (Supabase service role / local: supabase status → Secret)
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

/** Clerk webhook payload (minimal shape we use). */
interface ClerkWebhookPayload {
  type: string
  data: {
    id: string
    email_addresses?: Array< { email_address: string; id: string } >
    primary_email_address_id?: string | null
    first_name?: string | null
    last_name?: string | null
    public_metadata?: Record<string, unknown>
  }
}

function getPrimaryEmail(data: ClerkWebhookPayload['data']): string {
  const list = data.email_addresses ?? []
  const primaryId = data.primary_email_address_id
  if (primaryId) {
    const primary = list.find((e) => e.id === primaryId)
    if (primary?.email_address) return primary.email_address
  }
  return list[0]?.email_address ?? ''
}

function getUserType(data: ClerkWebhookPayload['data']): string {
  const meta = data.public_metadata
  if (meta && typeof meta === 'object' && typeof (meta as Record<string, unknown>).user_type === 'string') {
    return (meta as Record<string, string>).user_type
  }
  return 'individual'
}

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7375/ingest/41e1b5cc-e24f-4816-889b-7d8d01ee1ade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e1d2b7'},body:JSON.stringify({sessionId:'e1d2b7',location:'route.ts:POST:entry',message:'webhook POST received',data:{hasSecret:!!CLERK_WEBHOOK_SECRET,secretIsSigningKey:CLERK_WEBHOOK_SECRET?.startsWith('whsec_'),secretLooksLikeUrl:CLERK_WEBHOOK_SECRET?.startsWith('http')},timestamp:Date.now(),hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
  if (!CLERK_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[webhooks/clerk] Missing CLERK_WEBHOOK_SECRET, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

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

  const wh = new Webhook(CLERK_WEBHOOK_SECRET)
  let evt: ClerkWebhookPayload
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookPayload
    // #region agent log
    fetch('http://127.0.0.1:7375/ingest/41e1b5cc-e24f-4816-889b-7d8d01ee1ade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e1d2b7'},body:JSON.stringify({sessionId:'e1d2b7',location:'route.ts:POST:afterVerify',message:'signature verified',data:{evtType:evt.type,userId:evt.data?.id},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7375/ingest/41e1b5cc-e24f-4816-889b-7d8d01ee1ade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e1d2b7'},body:JSON.stringify({sessionId:'e1d2b7',location:'route.ts:POST:verifyCatch',message:'signature verification failed',data:{errName:(err as Error)?.name},timestamp:Date.now(),hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    console.error('[webhooks/clerk] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (evt.type !== 'user.created' && evt.type !== 'user.updated') {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const email = getPrimaryEmail(evt.data)
  // #region agent log
  fetch('http://127.0.0.1:7375/ingest/41e1b5cc-e24f-4816-889b-7d8d01ee1ade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e1d2b7'},body:JSON.stringify({sessionId:'e1d2b7',location:'route.ts:POST:afterEmail',message:'primary email resolved',data:{userId:evt.data.id,hasEmail:!!email},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  if (!email) {
    console.error('[webhooks/clerk] No email for user', evt.data.id)
    return NextResponse.json({ error: 'User has no email' }, { status: 400 })
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: evt.data.id,
      email,
      first_name: evt.data.first_name ?? null,
      last_name: evt.data.last_name ?? null,
      user_type: getUserType(evt.data),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  // #region agent log
  fetch('http://127.0.0.1:7375/ingest/41e1b5cc-e24f-4816-889b-7d8d01ee1ade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e1d2b7'},body:JSON.stringify({sessionId:'e1d2b7',location:'route.ts:POST:afterUpsert',message:'upsert result',data:{upsertOk:!error,upsertError:error?.message ?? null},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  if (error) {
    console.error('[webhooks/clerk] Supabase upsert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}
