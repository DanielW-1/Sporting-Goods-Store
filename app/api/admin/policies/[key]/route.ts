import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { z } from 'zod'

const policyUpdateSchema = z.object({ value: z.string().min(1, 'Value is required') })

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const profile = await requireRole(['admin'])
    const { key } = await params

    const body = await request.json()
    const result = policyUpdateSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('store_policies')
      .update({ value: result.data.value, updated_by: profile.id, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
