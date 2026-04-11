import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { refundSchema } from '@/lib/validations/support'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const profile = await requireAuth()
    const { id: orderId, itemId } = await params

    const body = await request.json()
    const result = refundSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { type, reason } = result.data
    const supabase = await createClient()

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) throw new ApiError(404, 'Order not found')

    const isStaff = ['support_staff', 'admin'].includes(profile.role)
    if (!isStaff && (order as any).customer_id !== profile.id) {
      throw new ApiError(403, 'Forbidden')
    }

    if ((order as any).status !== 'delivered') {
      throw new ApiError(400, 'Refunds are only allowed for delivered orders')
    }

    // Check refund window
    const { data: policies } = await supabase
      .from('store_policies')
      .select('key, value')
      .eq('key', 'refund_window_days')
      .single()

    const refundDays = parseInt((policies as any)?.value ?? '30', 10)
    const orderDate = new Date((order as any).order_date)
    const cutoff = new Date(orderDate.getTime() + refundDays * 24 * 60 * 60 * 1000)

    if (new Date() > cutoff) {
      throw new ApiError(400, `Refund window of ${refundDays} days has expired`)
    }

    // Fetch order item
    const { data: orderItem, error: itemErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', itemId)
      .eq('order_id', orderId)
      .single()

    if (itemErr || !orderItem) throw new ApiError(404, 'Order item not found')
    if ((orderItem as any).refund_status !== 'none') {
      throw new ApiError(400, 'This item has already been refunded or a refund was requested')
    }

    // Set refund_status to 'requested'
    const { error: updateErr } = await supabase
      .from('order_items')
      .update({ refund_status: 'requested' })
      .eq('id', itemId)

    if (updateErr) throw new ApiError(400, updateErr.message)

    // Auto-create a support ticket
    const { data: ticket } = await supabase
      .from('support_tickets')
      .insert({
        customer_id: profile.id,
        subject: `${type === 'refund' ? 'Refund' : 'Replacement'} request for order ${orderId}`,
        status: 'open',
      })
      .select()
      .single()

    if (ticket) {
      await supabase.from('chat_messages').insert({
        ticket_id: (ticket as any).id,
        sender_id: profile.id,
        message: reason,
      })
    }

    return Response.json({ message: 'Refund requested', ticket_id: (ticket as any)?.id })
  } catch (error) {
    return handleApiError(error)
  }
}
