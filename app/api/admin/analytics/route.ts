import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'

export async function GET() {
  try {
    await requireRole(['manager', 'admin'])
    const supabase = await createClient()

    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Monthly analytics from the view (revenue, transactions, unique customers, avg order value, refunds)
    const { data: monthlyAnalytics, error: analyticsErr } = await supabase
      .from('vw_manager_analytics')
      .select('*')

    if (analyticsErr) throw new ApiError(400, analyticsErr.message)

    // Profit data (cost, revenue, gross/net profit per month)
    const { data: profits } = await supabase
      .from('profits')
      .select('*')
      .order('month', { ascending: false })

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

    // Top 10 products by sales using the view
    const { data: topProductRows } = await supabase
      .from('vw_top_products')
      .select('product_id, name, category, brand, total_sales, avg_rating')
      .limit(10)

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

    // Derive this month / last month revenue from the view data
    const thisMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastMonthStr = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]

    const thisMonthRow = (monthlyAnalytics ?? []).find((r: any) =>
      r.month?.startsWith(thisMonthStr)
    )
    const lastMonthRow = (monthlyAnalytics ?? []).find((r: any) =>
      r.month?.startsWith(lastMonthStr)
    )

    return Response.json({
      revenue_this_month: Number((thisMonthRow as any)?.total_revenue ?? 0),
      revenue_last_month: Number((lastMonthRow as any)?.total_revenue ?? 0),
      total_orders: totalOrders,
      orders_by_status: ordersByStatus,
      top_selling_products: topProductRows ?? [],
      total_customers: totalCustomers,
      new_customers_this_month: newCustomers,
      monthly_analytics: monthlyAnalytics ?? [],
      profits: profits ?? [],
    })
  } catch (error) {
    return handleApiError(error)
  }
}
