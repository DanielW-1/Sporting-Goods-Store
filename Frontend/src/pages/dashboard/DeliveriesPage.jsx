import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, formatPrice, getStatusColor } from '../../lib/utils'

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [marking, setMarking] = useState(null)

  useEffect(() => {
    fetchDeliveries()
  }, [statusFilter])

  const fetchDeliveries = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const data = await api.get(`/deliveries${params}`)
      setDeliveries(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markDelivered = async (orderId) => {
    if (!confirm('Mark this order as delivered?')) return
    setMarking(orderId)
    try {
      await api.put(`/deliveries/${orderId}/status`, { status: 'delivered' })
      fetchDeliveries()
    } catch (err) {
      alert(err.message)
    } finally {
      setMarking(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Deliveries</h1>

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {deliveries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No deliveries assigned</div>
      ) : (
        <div className="space-y-4">
          {deliveries.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <p className="font-bold">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.order_date)}</p>
                  {order.shipping_address && (
                    <p className="text-sm text-gray-600 mt-1">To: {order.shipping_address}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => markDelivered(order.id)}
                      disabled={marking === order.id}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold disabled:opacity-50"
                    >
                      {marking === order.id ? 'Updating...' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">Items</p>
                <div className="space-y-1">
                  {order.order_items?.map(item => (
                    <p key={item.id} className="text-sm">
                      {item.products?.name} x{item.quantity} — {formatPrice(item.price_at_purchase * item.quantity)}
                    </p>
                  ))}
                </div>
                <p className="text-sm font-bold mt-2">Total: {formatPrice(order.total_amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeliveriesPage
