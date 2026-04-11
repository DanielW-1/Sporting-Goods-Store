import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { updateSupplierSchema } from '@/lib/validations/suppliers'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['manager', 'admin'])
    const { id } = await params

    const body = await request.json()
    const result = updateSupplierSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .update(result.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['manager', 'admin'])
    const { id } = await params

    const supabase = await createClient()
    const { error } = await supabase
      .from('suppliers')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) throw new ApiError(400, error.message)

    return Response.json({ message: 'Supplier deactivated' })
  } catch (error) {
    return handleApiError(error)
  }
}
