import { createClient } from '@/lib/supabase/server'
import { ApiError } from '@/lib/api/errors'
import type { Profile, Role } from '@/lib/supabase/types'

export async function requireRole(allowedRoles: Role[]): Promise<Profile> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new ApiError(401, 'Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new ApiError(401, 'User profile not found')
  }

  if (!allowedRoles.includes(profile.role as Role)) {
    throw new ApiError(403, 'Forbidden: insufficient permissions')
  }

  return profile as Profile
}

export async function requireAuth(): Promise<Profile> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new ApiError(401, 'Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new ApiError(401, 'User profile not found')
  }

  return profile as Profile
}
