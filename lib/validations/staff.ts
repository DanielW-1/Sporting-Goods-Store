import { z } from 'zod'

export const createScheduleSchema = z.object({
  staff_id: z.string().uuid('Invalid staff ID'),
  day_of_week: z.number().int().min(0).max(6, 'Day must be 0-6'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
})

export const updateScheduleSchema = createScheduleSchema.partial()

export const instorePurchaseSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'At least one item is required'),
  customer_email: z.string().email().optional(),
  payment_method: z.enum(['credit_card', 'debit_card', 'cash_on_delivery']),
})
