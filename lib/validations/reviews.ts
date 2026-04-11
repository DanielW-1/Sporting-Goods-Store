import { z } from 'zod'

export const createReviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(0).max(5, 'Rating must be between 0 and 5'),
  comment: z.string().optional(),
})

export const updateReviewSchema = z.object({
  rating: z.number().int().min(0).max(5).optional(),
  comment: z.string().optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
