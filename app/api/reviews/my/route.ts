import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'

export async function GET() {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(id, name, image_url)')
      .eq('customer_id', profile.id)
      .order('review_date', { ascending: false })

    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
