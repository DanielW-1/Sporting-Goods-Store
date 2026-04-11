import { z } from 'zod'

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})

export const assignTicketSchema = z.object({
  assigned_to: z.string().uuid('Invalid staff ID'),
})

export const ticketStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

export const chatbotSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

export const refundSchema = z.object({
  type: z.enum(['refund', 'replacement']),
  reason: z.string().min(1, 'Reason is required'),
})

export const approveRefundSchema = z.object({
  type: z.enum(['refund', 'replacement']),
})
