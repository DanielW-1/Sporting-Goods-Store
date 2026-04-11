import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET(request: NextRequest) {
  try {
    const profile = await requireRole(['driver'])
    const supabase = await createClient()

    const status = request.nextUrl.searchParams.get('status')

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(id, name))')
      .eq('driver_id', profile.id)
      .order('order_date', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
