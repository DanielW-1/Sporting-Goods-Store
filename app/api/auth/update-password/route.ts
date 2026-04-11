import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { updatePasswordSchema } from '@/lib/validations/auth'

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const result = updatePasswordSchema.safeParse(body)

    if (!result.success) {
      throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { error } = await supabase.auth.updateUser({ password: result.data.new_password })

    if (error) {
      throw new ApiError(400, error.message)
    }

    return Response.json({ message: 'Password updated successfully' }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
