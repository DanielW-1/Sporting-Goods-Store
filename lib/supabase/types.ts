// Database types for the Sports Goods Store
// Run `supabase gen types typescript` to regenerate from your Supabase project

export type Role =
  | 'customer'
  | 'staff'
  | 'inventory_staff'
  | 'support_staff'
  | 'driver'
  | 'manager'
  | 'admin'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash_on_delivery'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type RefundStatus = 'none' | 'requested' | 'refunded' | 'replaced'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  gender: string | null
  date_of_birth: string | null
  role: Role
  reward_points: number
  discount_points: number
  created_at: string
}

export interface Product {
  id: string
  supplier_id: string | null
  name: string
  brand: string | null
  description: string | null
  category: string
  subcategory: string | null
  price: number
  size: string | null
  color: string | null
  stock_quantity: number
  is_active: boolean
  release_date: string
  image_url: string | null
  created_at: string
}

export interface Discount {
  id: string
  product_id: string
  percentage: number
  start_date: string
  end_date: string
  category: string | null
  created_by: string | null
}

export interface Supplier {
  id: string
  company_name: string
  phone: string | null
  email: string | null
  status: 'active' | 'inactive'
}

export interface SupplierProduct {
  id: string
  supplier_id: string | null
  product_id: string | null
  supply_date: string | null
  quantity: number | null
  cost: number | null
  status: string
}

export interface Sponsor {
  id: string
  company_name: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface SponsoredProduct {
  id: string
  sponsor_id: string
  product_id: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  added_at: string
}

export interface Order {
  id: string
  customer_id: string | null
  driver_id: string | null
  order_date: string
  status: OrderStatus
  expected_delivery_date: string | null
  tracking_number: string | null
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  total_amount: number
  shipping_address: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  price_at_purchase: number
  refund_status: RefundStatus
}

export interface Review {
  id: string
  product_id: string
  customer_id: string
  rating: number
  comment: string | null
  review_date: string
}

export interface RewardsLog {
  id: string
  customer_id: string | null
  order_id: string | null
  points_earned: number
  points_used: number
  transaction_date: string
}

export interface SupportTicket {
  id: string
  customer_id: string | null
  assigned_to: string | null
  subject: string
  status: TicketStatus
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  ticket_id: string
  sender_id: string | null
  message: string
  is_bot: boolean
  created_at: string
}

export interface StaffAttendance {
  id: string
  staff_id: string | null
  clock_in: string
  clock_out: string | null
  date: string
}

export interface StaffSchedule {
  id: string
  staff_id: string | null
  day_of_week: number
  start_time: string
  end_time: string
}

export interface StorePolicy {
  id: string
  key: string
  value: string
  updated_by: string | null
  updated_at: string
}

// Placeholder to satisfy @supabase/supabase-js generic — replace with generated types
export type Database = Record<string, unknown>
