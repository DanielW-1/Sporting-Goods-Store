import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET() {
  try {
    const profile = await requireRole(['staff', 'inventory_staff', 'support_staff', 'driver', 'manager', 'admin'])
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('staff_attendance')
      .select('*')
      .eq('staff_id', profile.id)
      .order('date', { ascending: false })

    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
