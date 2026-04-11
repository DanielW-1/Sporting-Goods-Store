import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')
    }

    const { email, password, first_name, last_name, phone, address, date_of_birth, gender } = result.data

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, last_name, phone, address, date_of_birth, gender },
      },
    })

    if (error) {
      throw new ApiError(400, error.message)
    }

    // Update profile with additional fields (trigger creates the row with minimal data)
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ first_name, last_name, phone, address, date_of_birth, gender })
        .eq('id', data.user.id)
    }

    return Response.json(
      { user: { id: data.user?.id, email: data.user?.email }, message: 'Registration successful' },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
