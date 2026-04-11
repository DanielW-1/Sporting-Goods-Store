import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET() {
  try {
    await requireRole(['manager', 'admin'])
    const supabase = await createClient()

    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Total revenue this month
    const { data: thisMonthOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('order_date', startOfThisMonth)
      .neq('status', 'cancelled')

    const revenueThisMonth = (thisMonthOrders ?? []).reduce((s: number, o: any) => s + parseFloat(o.total_amount), 0)

    // Total revenue last month
    const { data: lastMonthOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('order_date', startOfLastMonth)
      .lt('order_date', endOfLastMonth)
      .neq('status', 'cancelled')

    const revenueLastMonth = (lastMonthOrders ?? []).reduce((s: number, o: any) => s + parseFloat(o.total_amount), 0)

    // Total orders
    const { count: totalOrders } = await supabase.from('orders').select('id', { count: 'exact', head: true })

    // Orders by status
    const { data: statusRows } = await supabase
      .from('orders')
      .select('status')

    const ordersByStatus: Record<string, number> = {}
    ;(statusRows ?? []).forEach((o: any) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1
    })

    // Top 10 products
    const { data: topItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, products(id, name, category)')
      .limit(200)

    const productSales: Record<string, { product: any; totalQty: number }> = {}
    ;(topItems ?? []).forEach((item: any) => {
      const pid = item.product_id
      productSales[pid] = productSales[pid]
        ? { product: item.products, totalQty: productSales[pid].totalQty + item.quantity }
        : { product: item.products, totalQty: item.quantity }
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 10)
      .map(({ product, totalQty }) => ({ ...product, total_quantity_sold: totalQty }))

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')

    // New customers this month
    const { count: newCustomers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', startOfThisMonth)

    return Response.json({
      revenue_this_month: revenueThisMonth,
      revenue_last_month: revenueLastMonth,
      total_orders: totalOrders,
      orders_by_status: ordersByStatus,
      top_selling_products: topProducts,
      total_customers: totalCustomers,
      new_customers_this_month: newCustomers,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
