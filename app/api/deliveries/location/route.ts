import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { z } from 'zod'

const locationSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export async function POST(request: Request) {
  try {
    const profile = await requireRole(['driver'])

    const body = await request.json()
    const result = locationSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { order_id, latitude, longitude } = result.data
    const supabase = await createClient()

    // Verify this order is assigned to the calling driver
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('driver_id, status')
      .eq('id', order_id)
      .single()

    if (orderErr || !order) throw new ApiError(404, 'Order not found')
    if ((order as any).driver_id !== profile.id) throw new ApiError(403, 'This order is not assigned to you')
    if ((order as any).status !== 'shipped') throw new ApiError(400, 'Location updates only apply to orders in transit')

    const { data, error } = await supabase
      .from('driver_locations')
      .insert({ driver_id: profile.id, order_id, latitude, longitude })
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
