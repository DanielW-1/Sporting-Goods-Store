import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { updateReviewSchema } from '@/lib/validations/reviews'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireAuth()
    const { id } = await params

    const body = await request.json()
    const result = updateReviewSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()

    // Verify ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('customer_id')
      .eq('id', id)
      .single()

    if (!review || (review as any).customer_id !== profile.id) {
      throw new ApiError(403, 'You can only edit your own reviews')
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(result.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const supabase = await createClient()

    const { data: review } = await supabase
      .from('reviews')
      .select('customer_id')
      .eq('id', id)
      .single()

    if (!review) throw new ApiError(404, 'Review not found')

    const isAdmin = profile.role === 'admin'
    if (!isAdmin && (review as any).customer_id !== profile.id) {
      throw new ApiError(403, 'You can only delete your own reviews')
    }

    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw new ApiError(400, error.message)

    return Response.json({ message: 'Review deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
