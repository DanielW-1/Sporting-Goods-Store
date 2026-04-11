import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { createSupplierSchema } from '@/lib/validations/suppliers'

export async function GET() {
  try {
    await requireRole(['manager', 'admin'])
    const supabase = await createClient()

    const { data, error } = await supabase.from('suppliers').select('*').order('company_name')
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
    const result = createSupplierSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .insert(result.data)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
