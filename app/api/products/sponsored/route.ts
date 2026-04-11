import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('sponsored_products')
      .select(`
        product_id,
        sponsors ( id, company_name, start_date, end_date, is_active ),
        products ( * )
      `)
      .eq('sponsors.is_active', true)
      .lte('sponsors.start_date', today)
      .gte('sponsors.end_date', today)

    if (error) throw new ApiError(400, error.message)

    // Filter out rows where sponsor join didn't match
    const filtered = (data ?? []).filter((row: any) => row.sponsors !== null && row.products !== null)

    return Response.json(filtered)
  } catch (error) {
    return handleApiError(error)
  }
}
