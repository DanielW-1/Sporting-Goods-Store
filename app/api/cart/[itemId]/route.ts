import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { updateCartItemSchema } from '@/lib/validations/cart'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const profile = await requireAuth()
    const { itemId } = await params

    const body = await request.json()
    const result = updateCartItemSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { quantity } = result.data
    const supabase = await createClient()

    // Verify item belongs to user
    const { data: item, error: fetchErr } = await supabase
      .from('cart_items')
      .select('*, products(stock_quantity)')
      .eq('id', itemId)
      .eq('user_id', profile.id)
      .single()

    if (fetchErr || !item) throw new ApiError(404, 'Cart item not found')

    // Remove if quantity = 0
    if (quantity === 0) {
      await supabase.from('cart_items').delete().eq('id', itemId)
      return Response.json({ message: 'Item removed from cart' })
    }

    const stock = (item as any).products?.stock_quantity ?? 0
    if (stock < quantity) throw new ApiError(400, 'Insufficient stock')

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
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
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const profile = await requireAuth()
    const { itemId } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', profile.id)

    if (error) throw new ApiError(400, error.message)

    return Response.json({ message: 'Item removed from cart' })
  } catch (error) {
    return handleApiError(error)
  }
}
