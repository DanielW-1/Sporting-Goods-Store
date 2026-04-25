import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, formatPrice, getStatusColor } from '../../lib/utils'

const STATUS_FLOW = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped / Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
]

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)
  const [selectedStatuses, setSelectedStatuses] = useState({})

  useEffect(() => {
    fetchDeliveries()
  }, [statusFilter])

  const fetchDeliveries = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const data = await api.get(`/deliveries${params}`)
      setDeliveries(data)
      // Pre-fill the selected status for each order
      const initStatuses = {}
      data.forEach(o => { initStatuses[o.id] = o.status })
      setSelectedStatuses(initStatuses)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId) => {
    const newStatus = selectedStatuses[orderId]
    if (!newStatus) return
    if (!confirm(`Update order status to "${newStatus}"?`)) return
    setUpdating(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      fetchDeliveries()
    } catch (err) {
      alert(err.message || 'Failed to update status. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Deliveries</h1>

      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Deliveries</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {deliveries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No deliveries assigned</div>
      ) : (
        <div className="space-y-4">
          {deliveries.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <p className="font-bold text-lg">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.order_date)}</p>
                  {order.tracking_number && (
                    <p className="text-xs text-gray-400 mt-0.5">Tracking: {order.tracking_number}</p>
                  )}
                  {order.shipping_address && (
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      Deliver to: {order.shipping_address}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-3 mb-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Items</p>
                <div className="space-y-1">
                  {order.order_items?.map(item => (
                    <p key={item.id} className="text-sm">
                      {item.products?.name} &times;{item.quantity} &mdash; {formatPrice(item.price_at_purchase * item.quantity)}
                    </p>
                  ))}
                </div>
                <p className="text-sm font-bold mt-2">Total: {formatPrice(order.total_amount)}</p>
              </div>

              {/* Status Update */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                  <div className="flex gap-3 items-center flex-wrap">
                    <select
                      value={selectedStatuses[order.id] || order.status}
                      onChange={e => setSelectedStatuses(prev => ({ ...prev, [order.id]: e.target.value }))}
                      className="border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      {STATUS_FLOW.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => updateStatus(order.id)}
                      disabled={updating === order.id || selectedStatuses[order.id] === order.status}
                      className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-40 hover:bg-orange-700 transition"
                    >
                      {updating === order.id ? 'Updating...' : 'Apply Update'}
                    </button>
                  </div>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-sm text-green-600 font-semibold">Delivery complete</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeliveriesPage
