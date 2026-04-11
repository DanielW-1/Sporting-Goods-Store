import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()

    if (error || !order) throw new ApiError(404, 'Order not found')

    const isManager = ['manager', 'admin'].includes(profile.role)
    if (!isManager && (order as any).customer_id !== profile.id) {
      throw new ApiError(403, 'Forbidden')
    }

    const { status } = order as any
    if (!['pending', 'processing'].includes(status)) {
      throw new ApiError(400, `Cannot cancel an order with status "${status}"`)
    }

    // Restore stock for each order item
    const items = (order as any).order_items ?? []
    for (const item of items) {
      const { data: prod } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single()

      if (prod) {
        await supabase
          .from('products')
          .update({ stock_quantity: (prod as any).stock_quantity + item.quantity })
          .eq('id', item.product_id)
      }
    }

    const updates: Record<string, string> = { status: 'cancelled' }
    if ((order as any).payment_status === 'paid') {
      updates.payment_status = 'refunded'
    }

    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) throw new ApiError(400, updateErr.message)

    return Response.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
