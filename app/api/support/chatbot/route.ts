import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'
import { chatbotSchema } from '@/lib/validations/support'

function matchKeyword(msg: string, keywords: string[]): boolean {
  const lower = msg.toLowerCase()
  return keywords.some(kw => lower.includes(kw))
}

export async function POST(request: Request) {
  try {
    const profile = await requireAuth()

    const body = await request.json()
    const result = chatbotSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const { message } = result.data
    const supabase = await createClient()

    // Order status inquiry
    if (matchKeyword(message, ['order', 'status', 'where is my', 'delivery', 'shipped', 'tracking'])) {
      const { data: latestOrder } = await supabase
        .from('orders')
        .select('id, status, tracking_number, expected_delivery_date')
        .eq('customer_id', profile.id)
        .order('order_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestOrder) {
        const o = latestOrder as any
        const reply = `Your latest order is currently "${o.status}".${
          o.tracking_number ? ` Tracking number: ${o.tracking_number}.` : ''
        }${o.expected_delivery_date ? ` Expected delivery: ${o.expected_delivery_date}.` : ''}`
        return Response.json({ reply })
      }
      return Response.json({ reply: "You don't have any orders yet." })
    }

    // Refund policy
    if (matchKeyword(message, ['refund', 'return', 'money back', 'policy'])) {
      const { data: policy } = await supabase
        .from('store_policies')
        .select('value')
        .eq('key', 'refund_window_days')
        .single()

      const days = (policy as any)?.value ?? '30'
      return Response.json({ reply: `Our refund policy allows returns within ${days} days of delivery for delivered orders.` })
    }

    // Store hours / general
    if (matchKeyword(message, ['hours', 'open', 'close', 'store', 'location', 'address'])) {
      return Response.json({
        reply: 'Our store is open Monday–Saturday, 9am–8pm, and Sunday 10am–6pm. Visit us online 24/7!'
      })
    }

    // Escalate to human agent
    if (matchKeyword(message, ['agent', 'human', 'person', 'staff', 'help', 'yes'])) {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .insert({
          customer_id: profile.id,
          subject: 'Chatbot escalation — customer requested agent',
          status: 'open',
        })
        .select()
        .single()

      if (ticket) {
        await supabase.from('chat_messages').insert({
          ticket_id: (ticket as any).id,
          sender_id: profile.id,
          message: `Original chatbot message: ${message}`,
        })
      }

      return Response.json({
        reply: "I've created a support ticket for you. A support agent will get back to you shortly.",
        escalate: true,
        ticket_id: (ticket as any)?.id,
      })
    }

    return Response.json({
      reply: "I can't help with that. Would you like to speak with a support agent?",
      escalate: false,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
