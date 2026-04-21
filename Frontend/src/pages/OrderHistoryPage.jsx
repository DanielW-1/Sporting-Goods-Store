import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { getStatusColor, formatDate, formatPrice } from '../lib/utils'

const OrderHistoryPage = () => {
  const { user, isRole } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', customer_id: '' })
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.status) params.set('status', filters.status)
        if (isRole(['manager', 'admin']) && filters.customer_id) params.set('customer_id', filters.customer_id)

        const data = await api.get(`/orders${params.toString() ? `?${params}` : ''}`)
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [filters, isRole])

  useEffect(() => {
    if (isRole(['manager', 'admin'])) {
      const fetchCustomers = async () => {
        try {
          const users = await api.get('/admin/users?role=customer')
          setCustomers(users)
        } catch (error) {
          console.error('Error fetching customers:', error)
        }
      }
      fetchCustomers()
    }
  }, [isRole])

  if (loading) return <LoadingSpinner />

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">When you place an order, it will appear here.</p>
        <Link to="/products" className="bg-orange-600 text-white px-6 py-3 font-bold uppercase inline-block hover:bg-orange-700">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      {/* Filters for admin/manager */}
      {isRole(['manager', 'admin']) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-2 border rounded text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.customer_id}
            onChange={(e) => setFilters({ ...filters, customer_id: e.target.value })}
            className="p-2 border rounded text-sm"
          >
            <option value="">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</span>
                <span className="mx-2">•</span>
                <span className="text-sm text-gray-500">{formatDate(order.order_date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <Link to={`/orders/${order.id}`} className="text-blue-600 text-sm hover:text-orange-600">
                  View Details →
                </Link>
              </div>
            </div>

            <div className="p-4">
              {order.order_items?.slice(0, 2).map(item => (
                <div key={item.id} className="flex gap-3 mb-3">
                  <img src={item.products?.image_url || 'https://via.placeholder.com/48'} alt={item.products?.name} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-medium text-sm">{item.products?.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} · ${item.price_at_purchase}</p>
                  </div>
                </div>
              ))}
              {order.order_items?.length > 2 && (
                <p className="text-xs text-gray-500">+{order.order_items.length - 2} more items</p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderHistoryPage