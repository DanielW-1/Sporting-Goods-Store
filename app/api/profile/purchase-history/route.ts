import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new ApiError(401, 'Unauthorized')

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products ( id, name, brand, image_url, category )
        )
      `)
      .eq('customer_id', user.id)
      .order('order_date', { ascending: false })

    if (error) throw new ApiError(400, error.message)

    return Response.json(orders)
  } catch (error) {
    return handleApiError(error)
  }
}
