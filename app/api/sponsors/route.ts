import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { createSponsorSchema } from '@/lib/validations/suppliers'

export async function GET() {
  try {
    await requireRole(['manager', 'admin'])
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sponsors')
      .select('*, sponsored_products(product_id, products(id, name))')
      .order('company_name')

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
    const result = createSponsorSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { company_name, start_date, end_date, product_ids } = result.data
    const supabase = await createClient()

    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .insert({ company_name, start_date, end_date, is_active: true })
      .select()
      .single()

    if (error || !sponsor) throw new ApiError(400, error?.message ?? 'Failed to create sponsor')

    if (product_ids && product_ids.length > 0) {
      await supabase.from('sponsored_products').insert(
        product_ids.map(pid => ({ sponsor_id: (sponsor as any).id, product_id: pid }))
      )
    }

    return Response.json(sponsor, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
