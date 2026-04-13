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

export type Database = {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string
          company_name: string
          phone: string | null
          email: string | null
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          company_name: string
          phone?: string | null
          email?: string | null
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          company_name?: string
          phone?: string | null
          email?: string | null
          status?: 'active' | 'inactive'
        }
        Relationships: []
      }
      profiles: {
        Row: {
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
          salary: number | null
          hire_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          address?: string | null
          gender?: string | null
          date_of_birth?: string | null
          role?: Role
          reward_points?: number
          discount_points?: number
          salary?: number | null
          hire_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          address?: string | null
          gender?: string | null
          date_of_birth?: string | null
          role?: Role
          reward_points?: number
          discount_points?: number
          salary?: number | null
          hire_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
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
          low_stock_threshold: number
          is_active: boolean
          release_date: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          name: string
          brand?: string | null
          description?: string | null
          category: string
          subcategory?: string | null
          price: number
          size?: string | null
          color?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          is_active?: boolean
          release_date?: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string | null
          name?: string
          brand?: string | null
          description?: string | null
          category?: string
          subcategory?: string | null
          price?: number
          size?: string | null
          color?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          is_active?: boolean
          release_date?: string
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          id: string
          product_id: string
          percentage: number
          start_date: string
          end_date: string
          category: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          product_id: string
          percentage: number
          start_date: string
          end_date: string
          category?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          percentage?: number
          start_date?: string
          end_date?: string
          category?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      supplier_products: {
        Row: {
          id: string
          supplier_id: string | null
          product_id: string | null
          supply_date: string | null
          quantity: number | null
          cost: number | null
          status: string
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          product_id?: string | null
          supply_date?: string | null
          quantity?: number | null
          cost?: number | null
          status?: string
        }
        Update: {
          id?: string
          supplier_id?: string | null
          product_id?: string | null
          supply_date?: string | null
          quantity?: number | null
          cost?: number | null
          status?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          id: string
          company_name: string
          start_date: string
          end_date: string
          is_active: boolean
        }
        Insert: {
          id?: string
          company_name: string
          start_date: string
          end_date: string
          is_active?: boolean
        }
        Update: {
          id?: string
          company_name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
        }
        Relationships: []
      }
      sponsored_products: {
        Row: {
          id: string
          sponsor_id: string
          product_id: string
        }
        Insert: {
          id?: string
          sponsor_id: string
          product_id: string
        }
        Update: {
          id?: string
          sponsor_id?: string
          product_id?: string
        }
        Relationships: []
      }
      stock: {
        Row: {
          id: string
          product_id: string
          supplier_id: string | null
          quantity_available: number
          reorder_level: number
          reorder_quantity: number
          warehouse_location: string | null
          stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
          batch_number: string | null
          expiry_date: string | null
          last_updated: string
        }
        Insert: {
          id?: string
          product_id: string
          supplier_id?: string | null
          quantity_available?: number
          reorder_level?: number
          reorder_quantity?: number
          warehouse_location?: string | null
          stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
          batch_number?: string | null
          expiry_date?: string | null
          last_updated?: string
        }
        Update: {
          id?: string
          product_id?: string
          supplier_id?: string | null
          quantity_available?: number
          reorder_level?: number
          reorder_quantity?: number
          warehouse_location?: string | null
          stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
          batch_number?: string | null
          expiry_date?: string | null
          last_updated?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          added_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
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
          notes: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          driver_id?: string | null
          order_date?: string
          status?: OrderStatus
          expected_delivery_date?: string | null
          tracking_number?: string | null
          payment_method: PaymentMethod
          payment_status?: PaymentStatus
          total_amount: number
          shipping_address?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          driver_id?: string | null
          order_date?: string
          status?: OrderStatus
          expected_delivery_date?: string | null
          tracking_number?: string | null
          payment_method?: PaymentMethod
          payment_status?: PaymentStatus
          total_amount?: number
          shipping_address?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price_at_purchase: number
          discount_applied: number
          refund_status: RefundStatus
          refund_requested_at: string | null
          refund_processed_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price_at_purchase: number
          discount_applied?: number
          refund_status?: RefundStatus
          refund_requested_at?: string | null
          refund_processed_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price_at_purchase?: number
          discount_applied?: number
          refund_status?: RefundStatus
          refund_requested_at?: string | null
          refund_processed_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string
          order_id: string | null
          rating: number
          comment: string | null
          review_date: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id: string
          order_id?: string | null
          rating: number
          comment?: string | null
          review_date?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string
          order_id?: string | null
          rating?: number
          comment?: string | null
          review_date?: string
        }
        Relationships: []
      }
      rewards_log: {
        Row: {
          id: string
          customer_id: string | null
          order_id: string | null
          points_earned: number
          discount_points_earned: number
          points_used: number
          transaction_date: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          order_id?: string | null
          points_earned?: number
          discount_points_earned?: number
          points_used?: number
          transaction_date?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          order_id?: string | null
          points_earned?: number
          discount_points_earned?: number
          points_used?: number
          transaction_date?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          customer_id: string | null
          assigned_to: string | null
          subject: string
          status: TicketStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          assigned_to?: string | null
          subject: string
          status?: TicketStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          assigned_to?: string | null
          subject?: string
          status?: TicketStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string | null
          message: string
          is_bot: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id?: string | null
          message: string
          is_bot?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string | null
          message?: string
          is_bot?: boolean
          created_at?: string
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          id: string
          staff_id: string | null
          clock_in: string
          clock_out: string | null
          date: string
        }
        Insert: {
          id?: string
          staff_id?: string | null
          clock_in: string
          clock_out?: string | null
          date?: string
        }
        Update: {
          id?: string
          staff_id?: string | null
          clock_in?: string
          clock_out?: string | null
          date?: string
        }
        Relationships: []
      }
      staff_schedules: {
        Row: {
          id: string
          staff_id: string | null
          day_of_week: number
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          staff_id?: string | null
          day_of_week: number
          start_time: string
          end_time: string
        }
        Update: {
          id?: string
          staff_id?: string | null
          day_of_week?: number
          start_time?: string
          end_time?: string
        }
        Relationships: []
      }
      driver_locations: {
        Row: {
          id: string
          driver_id: string
          order_id: string | null
          latitude: number
          longitude: number
          recorded_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          order_id?: string | null
          latitude: number
          longitude: number
          recorded_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          order_id?: string | null
          latitude?: number
          longitude?: number
          recorded_at?: string
        }
        Relationships: []
      }
      profits: {
        Row: {
          id: string
          month: string
          stock_cost: number
          stock_revenue: number
          stock_loss: number
          gross_profit: number
          net_profit: number
        }
        Insert: {
          id?: string
          month: string
          stock_cost?: number
          stock_revenue?: number
          stock_loss?: number
        }
        Update: {
          id?: string
          month?: string
          stock_cost?: number
          stock_revenue?: number
          stock_loss?: number
        }
        Relationships: []
      }
      store_policies: {
        Row: {
          id: string
          key: string
          value: string
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_product_catalog: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_active_sponsored: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_customer_dashboard: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_order_tracking: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_low_stock_alerts: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_manager_analytics: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_refund_eligible_items: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_staff_attendance: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_salary_report: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_top_products: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_support_dashboard: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vw_recommendation_inputs: {
        Row: Record<string, unknown>
        Relationships: []
      }
    }
    Functions: {
      update_stock_after_order: {
        Args: { p_order_id: string }
        Returns: void
      }
      calculate_points: {
        Args: { p_order_id: string; p_customer_id: string; p_amount_paid: number }
        Returns: void
      }
    }
  }
}
