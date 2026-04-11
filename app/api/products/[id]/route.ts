import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { updateProductSchema } from '@/lib/validations/products'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !product) throw new ApiError(404, 'Product not found')

    // Active discount
    const today = new Date().toISOString().split('T')[0]
    const { data: discount } = await supabase
      .from('discounts')
      .select('*')
      .eq('product_id', id)
      .lte('start_date', today)
      .gte('end_date', today)
      .limit(1)
      .maybeSingle()

    // Ratings
    const { data: reviewStats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', id)

    const reviewCount = reviewStats?.length ?? 0
    const avgRating = reviewCount > 0
      ? reviewStats!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null

    return Response.json({ ...product, active_discount: discount, avg_rating: avgRating, review_count: reviewCount })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['staff', 'inventory_staff', 'manager', 'admin'])
    const { id } = await params

    const body = await request.json()
    const result = updateProductSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
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
    await requireRole(['staff', 'inventory_staff', 'manager', 'admin'])
    const { id } = await params

    const supabase = await createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw new ApiError(400, error.message)

    return Response.json({ message: 'Product deactivated' })
  } catch (error) {
    return handleApiError(error)
  }
}
