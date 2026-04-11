import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { chatMessageSchema } from '@/lib/validations/support'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireAuth()
    const { id: ticketId } = await params

    const body = await request.json()
    const result = chatMessageSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()

    // Verify access: ticket owner or assigned staff
    const { data: ticket, error: tErr } = await supabase
      .from('support_tickets')
      .select('customer_id, assigned_to')
      .eq('id', ticketId)
      .single()

    if (tErr || !ticket) throw new ApiError(404, 'Ticket not found')

    const isStaff = ['support_staff', 'manager', 'admin'].includes(profile.role)
    const isOwner = (ticket as any).customer_id === profile.id
    const isAssigned = (ticket as any).assigned_to === profile.id

    if (!isOwner && !isAssigned && !isStaff) {
      throw new ApiError(403, 'Forbidden')
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ ticket_id: ticketId, sender_id: profile.id, message: result.data.message })
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    // Update ticket updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
