import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { instorePurchaseSchema } from '@/lib/validations/staff'

function generateTrackingNumber(): string {
  return 'INSTORE-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function POST(request: Request) {
  try {
    const staffProfile = await requireRole(['staff', 'manager', 'admin'])

    const body = await request.json()
    const result = instorePurchaseSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { items, customer_email, payment_method } = result.data
    const supabase = await createClient()

    // 1. Validate products
    const productDetails: Array<{ id: string; name: string; price: number; stock_quantity: number }> = []
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, is_active')
        .eq('id', item.product_id)
        .single()

      if (error || !product) throw new ApiError(404, `Product ${item.product_id} not found`)
      if (!(product as any).is_active) throw new ApiError(400, `Product ${(product as any).name} is unavailable`)
      if ((product as any).stock_quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${(product as any).name}`)
      }
      productDetails.push(product as any)
    }

    // 2. Look up customer if email provided
    let customerId: string | null = null
    if (customer_email) {
      const { data: customer } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer_email)
        .maybeSingle()
      customerId = (customer as any)?.id ?? null
    }

    // 3. Calculate total
    let total = 0
    const orderItemsData: Array<{ product_id: string; quantity: number; price_at_purchase: number }> = []

    items.forEach((item, idx) => {
      const product = productDetails[idx]
      const lineTotal = product.price * item.quantity
      total += lineTotal
      orderItemsData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price,
      })
    })

    total = parseFloat(total.toFixed(2))

    // 4. Create order (delivered immediately for in-store)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'delivered',
        payment_method,
        payment_status: payment_method === 'cash_on_delivery' ? 'pending' : 'paid',
        total_amount: total,
        shipping_address: 'In-Store Purchase',
        tracking_number: generateTrackingNumber(),
        order_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderErr || !order) throw new ApiError(400, orderErr?.message ?? 'Failed to create order')

    // 5. Create order items
    await supabase.from('order_items').insert(
      orderItemsData.map(i => ({ ...i, order_id: (order as any).id }))
    )

    // 6. Decrement stock
    for (const item of items) {
      const product = productDetails.find(p => p.id === item.product_id)!
      await supabase
        .from('products')
        .update({ stock_quantity: product.stock_quantity - item.quantity })
        .eq('id', item.product_id)
    }

    // 7. Award points if linked to customer
    if (customerId) {
      await supabase.rpc('calculate_points', {
        p_order_id: (order as any).id,
        p_customer_id: customerId,
        p_amount_paid: total,
      })
    }

    // 8. Build receipt
    const receipt = {
      order_id: (order as any).id,
      tracking_number: (order as any).tracking_number,
      date: new Date().toISOString(),
      items: items.map((item, idx) => ({
        name: productDetails[idx].name,
        quantity: item.quantity,
        unit_price: productDetails[idx].price,
        subtotal: productDetails[idx].price * item.quantity,
      })),
      total,
      payment_method,
      customer_email: customer_email ?? 'Guest',
      served_by: `${staffProfile.first_name} ${staffProfile.last_name}`,
    }

    return Response.json({ order, receipt }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
