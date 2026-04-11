import { z } from 'zod'

export const createSupplierSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

export const updateSupplierSchema = createSupplierSchema.partial()

export const createSponsorSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  product_ids: z.array(z.string().uuid()).optional().default([]),
})

export const updateSponsorSchema = z.object({
  company_name: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().optional(),
})
