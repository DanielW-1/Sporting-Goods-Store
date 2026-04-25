import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatPrice, formatDate } from '../../lib/utils'

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
)

const AnalyticsPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return <div className="p-8 text-gray-500">Failed to load analytics.</div>

  const revenueDiff = data.revenue_this_month - data.revenue_last_month
  const revenueDiffPct = data.revenue_last_month > 0
    ? ((revenueDiff / data.revenue_last_month) * 100).toFixed(1)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue This Month"
          value={formatPrice(data.revenue_this_month)}
          sub={revenueDiffPct ? `${revenueDiff >= 0 ? '+' : ''}${revenueDiffPct}% vs last month` : undefined}
        />
        <StatCard label="Revenue Last Month" value={formatPrice(data.revenue_last_month)} />
        <StatCard label="Total Orders" value={data.total_orders?.toLocaleString()} />
        <StatCard label="Total Customers" value={data.total_customers?.toLocaleString()} sub={`${data.new_customers_this_month} new this month`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-bold text-lg mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(data.orders_by_status || {}).map(([status, count]) => {
              const pct = data.total_orders > 0 ? Math.round((count / data.total_orders) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-bold text-lg mb-4">Monthly Revenue</h2>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {(data.monthly_analytics || []).slice(0, 12).map((row, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-600">{row.month ? new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</span>
                <div className="text-right">
                  <span className="font-medium">{formatPrice(Number(row.total_revenue || 0))}</span>
                  <span className="text-gray-400 ml-3 text-xs">{row.transaction_count} orders</span>
                </div>
              </div>
            ))}
            {(!data.monthly_analytics || data.monthly_analytics.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <div className="p-5 border-b border-gray-200">
          <h2 className="font-bold text-lg">Top Selling Products</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Total Sales</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Avg Rating</th>
            </tr>
          </thead>
          <tbody>
            {(data.top_selling_products || []).length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No sales data yet</td></tr>
            ) : data.top_selling_products.map((p, i) => (
              <tr key={p.product_id} className="border-t border-gray-200">
                <td className="px-4 py-3 text-gray-400 text-sm">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-sm">{p.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.category}</td>
                <td className="px-4 py-3 text-sm font-semibold">{p.total_sales}</td>
                <td className="px-4 py-3 text-sm">{p.avg_rating ? `${Number(p.avg_rating).toFixed(1)} ★` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AnalyticsPage
