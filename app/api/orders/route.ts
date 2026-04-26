import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth, requireRole } from '@/lib/auth/requireRole'
import { checkoutSchema } from '@/lib/validations/orders'

function generateTrackingNumber(): string {
  return 'TRK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: Request) {
  try {
    const profile = await requireAuth()

    const body = await request.json()
    const result = checkoutSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { payment_method, shipping_address, notes, use_reward_points, use_discount_points } = result.data
    const buyNow = (body as any).buy_now as { product_id: string; quantity: number; price: number } | undefined
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    let cartItems: any[]

    if (buyNow) {
      // Buy Now — single product purchase without touching cart
      const { data: product, error: productErr } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, is_active')
        .eq('id', buyNow.product_id)
        .single()

      if (productErr || !product) throw new ApiError(400, 'Product not found')
      if (!product.is_active) throw new ApiError(400, `Product ${product.name} is unavailable`)
      if (product.stock_quantity < buyNow.quantity) throw new ApiError(400, `Insufficient stock for ${product.name}`)

      cartItems = [{ product_id: product.id, quantity: buyNow.quantity, products: product }]
    } else {
      // Normal cart checkout
      const { data: fetchedItems, error: cartErr } = await supabase
        .from('cart_items')
        .select('*, products(id, name, price, stock_quantity, is_active)')
        .eq('user_id', profile.id)

      if (cartErr) throw new ApiError(400, cartErr.message)
      if (!fetchedItems || fetchedItems.length === 0) throw new ApiError(400, 'Cart is empty')

      for (const item of fetchedItems) {
        const product = (item as any).products
        if (!product || !product.is_active) throw new ApiError(400, `Product ${product?.name ?? item.product_id} is unavailable`)
        if (product.stock_quantity < item.quantity) throw new ApiError(400, `Insufficient stock for ${product.name}`)
      }

      cartItems = fetchedItems
    }

    // 3. Calculate total with discounts
    let total = 0
    const itemsWithPrices: Array<{ product_id: string; quantity: number; price_at_purchase: number; discount_applied: number }> = []

    for (const item of cartItems) {
      const product = (item as any).products
      let unitPrice: number = product.price
      let discountApplied = 0

      // Check active discount
      const { data: discount } = await supabase
        .from('discounts')
        .select('percentage')
        .eq('product_id', product.id)
        .lte('start_date', today)
        .gte('end_date', today)
        .limit(1)
        .maybeSingle()

      if (discount) {
        discountApplied = discount.percentage
        unitPrice = unitPrice * (1 - discount.percentage / 100)
      }

      total += unitPrice * item.quantity
      itemsWithPrices.push({ product_id: product.id, quantity: item.quantity, price_at_purchase: parseFloat(unitPrice.toFixed(2)), discount_applied: discountApplied })
    }

    // 4. Load policies
    const { data: policies } = await supabase.from('store_policies').select('key, value')
    const policyMap: Record<string, number> = {}
    ;(policies ?? []).forEach((p: any) => { policyMap[p.key] = parseFloat(p.value) })

    let pointsUsed = 0

    // 5. Apply discount points
    if (use_discount_points && profile.discount_points > 0) {
      const dpValue = policyMap['discount_points_value_cents'] ?? 1
      const maxDiscount = (profile.discount_points * dpValue) / 100
      const deduction = Math.min(maxDiscount, total)
      total -= deduction
      pointsUsed = Math.ceil((deduction * 100) / dpValue)
    }

    // 6. Apply reward points
    if (use_reward_points && profile.reward_points > 0) {
      const rpValue = policyMap['reward_points_value_cents'] ?? 1
      const maxDiscount = (profile.reward_points * rpValue) / 100
      const deduction = Math.min(maxDiscount, total)
      total -= deduction
    }

    total = Math.max(0, parseFloat(total.toFixed(2)))

    // 7. Mock payment
    const payment_status = payment_method === 'cash_on_delivery' ? 'pending' : 'paid'

    // 8. Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: profile.id,
        status: 'pending',
        payment_method,
        payment_status,
        total_amount: total,
        shipping_address,
        notes: notes ?? null,
        tracking_number: generateTrackingNumber(),
      })
      .select()
      .single()

    if (orderErr || !order) throw new ApiError(400, orderErr?.message ?? 'Failed to create order')

    // 9. Create order items
    const orderItemsData = itemsWithPrices.map(item => ({ ...item, order_id: order.id }))
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsData)
    if (itemsErr) throw new ApiError(400, itemsErr.message)

    // 10. Decrement stock (RPC handles all order items atomically)
    await supabase.rpc('update_stock_after_order', { p_order_id: order.id })

    // 11. Deduct points from profile
    if (use_discount_points || use_reward_points) {
      const pointUpdates: { discount_points?: number; reward_points?: number } = {}
      if (use_discount_points) pointUpdates.discount_points = Math.max(0, profile.discount_points - pointsUsed)
      if (use_reward_points) {
        const rpValue = policyMap['reward_points_value_cents'] ?? 1
        const maxDiscount = (profile.reward_points * rpValue) / 100
        const deduction = Math.min(maxDiscount, total + maxDiscount) // recalc
        const rpUsed = Math.ceil((deduction * 100) / rpValue)
        pointUpdates.reward_points = Math.max(0, profile.reward_points - rpUsed)
      }
      await supabase.from('profiles').update(pointUpdates).eq('id', profile.id)
    }

    // 12. Award points
    await supabase.rpc('calculate_points', {
      p_order_id: order.id,
      p_customer_id: profile.id,
      p_amount_paid: total,
    })

    // 13. Clear cart (only for normal checkout, not buy-now)
    if (!buyNow) {
      await supabase.from('cart_items').delete().eq('user_id', profile.id)
    }

    // Return order with items
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single()

    return Response.json(fullOrder, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()
    const { searchParams } = request.nextUrl

    const isManager = ['manager', 'admin'].includes(profile.role)

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(id, name))')
      .order('order_date', { ascending: false })

    if (!isManager) {
      query = query.eq('customer_id', profile.id)
    } else {
      const status   = searchParams.get('status')
      const customerId = searchParams.get('customer_id')
      const dateFrom = searchParams.get('date_from')
      const dateTo   = searchParams.get('date_to')
      if (status)     query = query.eq('status', status as import('@/lib/supabase/types').OrderStatus)
      if (customerId) query = query.eq('customer_id', customerId)
      if (dateFrom)   query = query.gte('order_date', dateFrom)
      if (dateTo)     query = query.lte('order_date', dateTo)
    }

    const { data, error } = await query
    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
