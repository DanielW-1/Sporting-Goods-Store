import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { addToCartSchema } from '@/lib/validations/cart'

export async function GET() {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id, name, brand, price, stock_quantity, image_url, is_active,
          discounts ( id, percentage, start_date, end_date )
        )
      `)
      .eq('user_id', profile.id)

    if (error) throw new ApiError(400, error.message)

    // Attach only active discounts
    const enriched = (data ?? []).map((item: any) => {
      const product = item.products
      const activeDiscount = (product?.discounts ?? []).find(
        (d: any) => d.start_date <= today && d.end_date >= today
      ) ?? null
      return { ...item, products: { ...product, active_discount: activeDiscount, discounts: undefined } }
    })

    return Response.json(enriched)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireAuth()

    const body = await request.json()
    const result = addToCartSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { product_id, quantity } = result.data
    const supabase = await createClient()

    // Validate product
    const { data: product, error: pErr } = await supabase
      .from('products')
      .select('id, is_active, stock_quantity')
      .eq('id', product_id)
      .single()

    if (pErr || !product) throw new ApiError(404, 'Product not found')
    if (!product.is_active) throw new ApiError(400, 'Product is not available')
    if (product.stock_quantity < quantity) throw new ApiError(400, 'Insufficient stock')

    // Upsert cart item
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({ user_id: profile.id, product_id, quantity }, { onConflict: 'user_id,product_id' })
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE() {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', profile.id)

    if (error) throw new ApiError(400, error.message)

    return Response.json({ message: 'Cart cleared' })
  } catch (error) {
    return handleApiError(error)
  }
}
