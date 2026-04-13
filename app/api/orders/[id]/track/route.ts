import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('status, tracking_number, expected_delivery_date, customer_id, driver_id')
      .eq('id', id)
      .single()

    if (error || !order) throw new ApiError(404, 'Order not found')

    const isManager = ['manager', 'admin'].includes(profile.role)
    if (!isManager && (order as any).customer_id !== profile.id) {
      throw new ApiError(403, 'Forbidden')
    }

    let driver_name: string | null = null
    let driver_location: { latitude: number; longitude: number; recorded_at: string } | null = null

    if ((order as any).driver_id) {
      const { data: driver } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', (order as any).driver_id)
        .single()

      if (driver) {
        driver_name = `${(driver as any).first_name} ${(driver as any).last_name}`
      }

      // Fetch the most recent driver location for this order
      const { data: location } = await supabase
        .from('driver_locations')
        .select('latitude, longitude, recorded_at')
        .eq('driver_id', (order as any).driver_id)
        .eq('order_id', id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (location) {
        driver_location = location as any
      }
    }

    return Response.json({
      status: (order as any).status,
      tracking_number: (order as any).tracking_number,
      expected_delivery_date: (order as any).expected_delivery_date,
      driver_name,
      driver_location,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
