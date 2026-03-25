import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * @description Builds a Supabase client using the service role key for trusted server-only operations after session checks.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key)
}
