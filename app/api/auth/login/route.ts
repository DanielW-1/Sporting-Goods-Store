import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { loginSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')
    }

    const { email, password } = result.data
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      throw new ApiError(401, 'Invalid email or password')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return Response.json({ session: data.session, user: profile }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
