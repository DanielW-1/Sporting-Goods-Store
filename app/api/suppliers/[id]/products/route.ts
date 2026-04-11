import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['manager', 'admin'])
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('supplier_products')
      .select('*, products(*)')
      .eq('supplier_id', id)

    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
