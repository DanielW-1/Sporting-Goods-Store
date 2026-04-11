import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['manager', 'admin'])
    const supabase = await createClient()

    const role = request.nextUrl.searchParams.get('role')

    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (role) query = query.eq('role', role)

    const { data, error } = await query
    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
