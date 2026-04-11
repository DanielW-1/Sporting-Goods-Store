import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { approveRefundSchema } from '@/lib/validations/support'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderItemId: string }> }
) {
  try {
    await requireRole(['support_staff', 'manager', 'admin'])
    const { orderItemId } = await params

    const body = await request.json()
    const result = approveRefundSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { type } = result.data
    const supabase = await createClient()

    const { data: orderItem, error: itemErr } = await supabase
      .from('order_items')
      .select('*, orders(*)')
      .eq('id', orderItemId)
      .single()

    if (itemErr || !orderItem) throw new ApiError(404, 'Order item not found')
    if ((orderItem as any).refund_status !== 'requested') {
      throw new ApiError(400, 'This item does not have a pending refund request')
    }

    if (type === 'refund') {
      await supabase
        .from('order_items')
        .update({ refund_status: 'refunded' })
        .eq('id', orderItemId)

      // Check if all items are refunded — if so, mark order as refunded
      const { data: allItems } = await supabase
        .from('order_items')
        .select('refund_status')
        .eq('order_id', (orderItem as any).order_id)

      const allRefunded = allItems?.every(
        (i: any) => i.refund_status === 'refunded' || i.refund_status === 'replaced'
      )

      if (allRefunded) {
        await supabase
          .from('orders')
          .update({ payment_status: 'refunded' })
          .eq('id', (orderItem as any).order_id)
      }
    } else {
      // Replacement
      await supabase
        .from('order_items')
        .update({ refund_status: 'replaced' })
        .eq('id', orderItemId)
    }

    return Response.json({ message: `${type} approved successfully` })
  } catch (error) {
    return handleApiError(error)
  }
}
