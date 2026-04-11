import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { createDiscountSchema } from '@/lib/validations/products'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(['staff', 'manager', 'admin'])
    const { id: product_id } = await params

    const body = await request.json()
    const result = createDiscountSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('discounts')
      .insert({ ...result.data, product_id, created_by: profile.id })
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
