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
      .select('*, order_items(*, products(id, name, brand, image_url))')
      .eq('id', id)
      .single()

    if (error || !order) throw new ApiError(404, 'Order not found')

    const isManager = ['manager', 'admin'].includes(profile.role)
    if (!isManager && (order as any).customer_id !== profile.id) {
      throw new ApiError(403, 'Forbidden')
    }

    return Response.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}
