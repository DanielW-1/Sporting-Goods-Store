import { z } from 'zod'

export const checkoutSchema = z.object({
  payment_method: z.enum(['credit_card', 'debit_card', 'cash_on_delivery']),
  shipping_address: z.string().min(1, 'Shipping address is required'),
  notes: z.string().optional(),
  use_reward_points: z.boolean().optional().default(false),
  use_discount_points: z.boolean().optional().default(false),
})

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  expected_delivery_date: z.string().optional(),
})

export const assignDriverSchema = z.object({
  driver_id: z.string().uuid('Invalid driver ID'),
})

// Valid status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:    ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
}

export type CheckoutInput = z.infer<typeof checkoutSchema>
