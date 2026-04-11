import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { assignDriverSchema } from '@/lib/validations/orders'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['manager', 'admin'])
    const { id } = await params

    const body = await request.json()
    const result = assignDriverSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { driver_id } = result.data
    const supabase = await createClient()

    // Verify driver exists and has driver role
    const { data: driver, error: driverErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', driver_id)
      .single()

    if (driverErr || !driver || (driver as any).role !== 'driver') {
      throw new ApiError(400, 'Invalid driver ID or user is not a driver')
    }

    const { data: updated, error } = await supabase
      .from('orders')
      .update({ driver_id })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
