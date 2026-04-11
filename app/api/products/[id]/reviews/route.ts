import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles ( first_name, last_name )
      `)
      .eq('product_id', id)
      .order('review_date', { ascending: false })

    if (error) throw new ApiError(400, error.message)

    return Response.json(reviews)
  } catch (error) {
    return handleApiError(error)
  }
}
