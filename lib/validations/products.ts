import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  supplier_id: z.string().uuid().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  subcategory: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  stock_quantity: z.number().int().min(0).default(0),
  release_date: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
})

export const updateProductSchema = createProductSchema.partial().extend({
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative').optional(),
  is_active: z.boolean().optional(),
})

export const createDiscountSchema = z.object({
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  category: z.string().optional(),
})

export const updateDiscountSchema = createDiscountSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
