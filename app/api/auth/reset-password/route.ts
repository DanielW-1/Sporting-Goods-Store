import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { resetPasswordSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')
    }

    const supabase = await createClient()
    await supabase.auth.resetPasswordForEmail(result.data.email)

    // Always return 200 — do not reveal whether email exists
    return Response.json({ message: 'If that email exists, a reset link has been sent.' }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
