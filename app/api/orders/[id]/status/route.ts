import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { orderStatusSchema, VALID_TRANSITIONS } from '@/lib/validations/orders'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['staff', 'driver', 'manager', 'admin'])
    const { id } = await params

    const body = await request.json()
    const result = orderStatusSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { status: newStatus, expected_delivery_date } = result.data
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()

    if (error || !order) throw new ApiError(404, 'Order not found')

    const currentStatus = (order as any).status
    const allowed = VALID_TRANSITIONS[currentStatus] ?? []

    if (!allowed.includes(newStatus)) {
      throw new ApiError(400, `Cannot transition from "${currentStatus}" to "${newStatus}"`)
    }

    if (newStatus === 'shipped' && !expected_delivery_date) {
      throw new ApiError(400, 'expected_delivery_date is required when shipping an order')
    }

    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        ...(expected_delivery_date ? { expected_delivery_date } : {}),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) throw new ApiError(400, updateErr.message)

    return Response.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
