import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function POST() {
  try {
    const profile = await requireRole(['staff', 'inventory_staff', 'support_staff', 'driver', 'manager', 'admin'])
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]

    // Check for open attendance record today
    const { data: existing } = await supabase
      .from('staff_attendance')
      .select('id')
      .eq('staff_id', profile.id)
      .eq('date', today)
      .is('clock_out', null)
      .maybeSingle()

    if (existing) throw new ApiError(400, 'You already have an open clock-in for today')

    const { data, error } = await supabase
      .from('staff_attendance')
      .insert({ staff_id: profile.id, clock_in: new Date().toISOString(), date: today })
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
