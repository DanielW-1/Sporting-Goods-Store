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

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*, chat_messages(*, profiles(first_name, last_name))')
      .eq('id', id)
      .single()

    if (error || !ticket) throw new ApiError(404, 'Ticket not found')

    const isStaff = ['support_staff', 'manager', 'admin'].includes(profile.role)
    if (!isStaff && (ticket as any).customer_id !== profile.id) {
      throw new ApiError(403, 'Forbidden')
    }

    return Response.json(ticket)
  } catch (error) {
    return handleApiError(error)
  }
}
