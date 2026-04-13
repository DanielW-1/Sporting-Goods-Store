import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vw_active_sponsored')
      .select('*')

    if (error) throw new ApiError(400, error.message)

    return Response.json(data ?? [])
  } catch (error) {
    return handleApiError(error)
  }
}
