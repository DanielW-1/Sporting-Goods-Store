import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { createScheduleSchema } from '@/lib/validations/staff'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['manager', 'admin'])
    const supabase = await createClient()

    const staffId = request.nextUrl.searchParams.get('staff_id')

    let query = supabase
      .from('staff_schedules')
      .select('*, profiles(first_name, last_name, role)')
      .order('day_of_week')

    if (staffId) query = query.eq('staff_id', staffId)

    const { data, error } = await query
    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['manager', 'admin'])

    const body = await request.json()
    const result = createScheduleSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('staff_schedules')
      .insert(result.data)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
