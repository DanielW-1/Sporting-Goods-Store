import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { createTicketSchema } from '@/lib/validations/support'

export async function POST(request: Request) {
  try {
    const profile = await requireAuth()

    const body = await request.json()
    const result = createTicketSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { subject, message } = result.data
    const supabase = await createClient()

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({ customer_id: profile.id, subject, status: 'open' })
      .select()
      .single()

    if (error || !ticket) throw new ApiError(400, error?.message ?? 'Failed to create ticket')

    await supabase.from('chat_messages').insert({
      ticket_id: (ticket as any).id,
      sender_id: profile.id,
      message,
    })

    return Response.json(ticket, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()
    const { searchParams } = request.nextUrl

    const isStaff = ['support_staff', 'manager', 'admin'].includes(profile.role)

    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isStaff) {
      query = query.eq('customer_id', profile.id)
    } else {
      const status      = searchParams.get('status')
      const assignedTo  = searchParams.get('assigned_to')
      if (status)     query = query.eq('status', status as import('@/lib/supabase/types').TicketStatus)
      if (assignedTo) query = query.eq('assigned_to', assignedTo)
    }

    const { data, error } = await query
    if (error) throw new ApiError(400, error.message)

    return Response.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
