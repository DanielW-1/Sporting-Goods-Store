import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { createReviewSchema } from '@/lib/validations/reviews'

export async function POST(request: Request) {
  try {
    const profile = await requireAuth()

    const body = await request.json()
    const result = createReviewSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { product_id, rating, comment } = result.data
    const supabase = await createClient()

    // Verify user purchased this product in a delivered order
    const { data: purchased } = await supabase
      .from('order_items')
      .select('id, orders!inner(customer_id, status)')
      .eq('product_id', product_id)
      .eq('orders.customer_id', profile.id)
      .eq('orders.status', 'delivered')
      .limit(1)

    if (!purchased || purchased.length === 0) {
      throw new ApiError(403, 'You can only review products you have purchased and received')
    }

    // Check no existing review
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('customer_id', profile.id)
      .maybeSingle()

    if (existing) throw new ApiError(400, 'You have already reviewed this product')

    const { data, error } = await supabase
      .from('reviews')
      .insert({ product_id, customer_id: profile.id, rating, comment })
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
