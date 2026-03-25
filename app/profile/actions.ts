'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { createServiceRoleSupabaseClient } from '@/lib/supabase-service-role'

export interface DeleteUserAccountResult {
  success: boolean
  error?: string
}

interface ProfileSoftDeleteRow {
  email: string
  status: string
}

/**
 * @description Implements a robust soft-delete with email masking to preserve audit trails while allowing for future re-registration with the same email.
 * @param userId Clerk user id; must match the signed-in session.
 */
export async function deleteUserAccount(userId: string): Promise<DeleteUserAccountResult> {
  const { userId: sessionUserId } = await auth()
  if (!sessionUserId || sessionUserId !== userId) {
    return { success: false, error: 'Unauthorized' }
  }

  let supabase
  try {
    supabase = createServiceRoleSupabaseClient()
  } catch {
    return { success: false, error: 'Server configuration error' }
  }

  const { data: row, error: fetchError } = await supabase
    .from('profiles')
    .select('email, status')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError) {
    return { success: false, error: 'Could not load profile' }
  }

  const profile = row as ProfileSoftDeleteRow | null
  if (!profile) {
    return { success: false, error: 'Profile not found' }
  }
  if (profile.status === 'deleted') {
    return { success: false, error: 'Account is already deactivated' }
  }

  const previousEmail = profile.email
  const maskedEmail = `deleted_${userId}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      status: 'deleted',
      original_email: previousEmail,
      email: maskedEmail,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .eq('status', 'active')

  if (updateError) {
    return { success: false, error: 'Could not deactivate account' }
  }

  try {
    const client = await clerkClient()
    await client.users.deleteUser(userId)
  } catch {
    await supabase
      .from('profiles')
      .update({
        status: 'active',
        original_email: null,
        email: previousEmail,
        deleted_at: null,
      })
      .eq('id', userId)

    return {
      success: false,
      error: 'Account could not be removed from authentication. Your profile was restored; try again or contact support.',
    }
  }

  return { success: true }
}
