import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { z } from 'zod'

const updateProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new ApiError(401, 'Unauthorized')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) throw new ApiError(404, 'Profile not found')

    return Response.json(profile)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new ApiError(401, 'Unauthorized')

    const body = await request.json()
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    // If no valid fields after stripping disallowed ones (e.g. role), return current profile unchanged
    if (Object.keys(result.data).length === 0) {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (fetchError || !profile) throw new ApiError(404, 'Profile not found')
      return Response.json(profile)
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(result.data)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (error) throw new ApiError(400, error.message)
    if (!data) throw new ApiError(404, 'Profile not found or update not permitted')

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
