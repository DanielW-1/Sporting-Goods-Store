import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function POST() {
  try {
    const profile = await requireRole(['staff', 'inventory_staff', 'support_staff', 'driver', 'manager', 'admin'])
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]

    const { data: record, error: fetchErr } = await supabase
      .from('staff_attendance')
      .select('id')
      .eq('staff_id', profile.id)
      .eq('date', today)
      .is('clock_out', null)
      .maybeSingle()

    if (fetchErr || !record) throw new ApiError(400, 'No open clock-in record found for today')

    const { data, error } = await supabase
      .from('staff_attendance')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', (record as any).id)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
