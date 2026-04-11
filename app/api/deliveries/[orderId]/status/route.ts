import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { z } from 'zod'

const deliveryStatusSchema = z.object({
  status: z.enum(['delivered']),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const profile = await requireRole(['driver'])
    const { orderId } = await params

    const body = await request.json()
    const result = deliveryStatusSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()

    // Verify order is assigned to this driver and is shipped
    const { data: order, error } = await supabase
      .from('orders')
      .select('driver_id, status')
      .eq('id', orderId)
      .single()

    if (error || !order) throw new ApiError(404, 'Order not found')
    if ((order as any).driver_id !== profile.id) throw new ApiError(403, 'This order is not assigned to you')
    if ((order as any).status !== 'shipped') throw new ApiError(400, 'Order must be in "shipped" status to mark as delivered')

    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId)
      .select()
      .single()

    if (updateErr) throw new ApiError(400, updateErr.message)

    return Response.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
