import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['manager', 'admin'])
    const supabase = await createClient()

    const { searchParams } = request.nextUrl
    const staffId  = searchParams.get('staff_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo   = searchParams.get('date_to')

    let query = supabase
      .from('staff_attendance')
      .select('*, profiles(first_name, last_name, email, role)')
      .order('date', { ascending: false })

    if (staffId)  query = query.eq('staff_id', staffId)
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo)   query = query.lte('date', dateTo)

    const { data, error } = await query
    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
