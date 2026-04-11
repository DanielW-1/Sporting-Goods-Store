import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET() {
  try {
    await requireRole(['admin'])
    const supabase = await createClient()

    const { data, error } = await supabase.from('store_policies').select('*').order('key')
    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
