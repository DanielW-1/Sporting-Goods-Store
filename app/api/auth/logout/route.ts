import { createClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/api/errors'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return Response.json({ message: 'Logged out successfully' }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
