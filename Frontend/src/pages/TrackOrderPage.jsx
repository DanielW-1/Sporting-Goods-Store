import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { getStatusColor, formatDate, formatPrice } from '../lib/utils'

const TrackOrderPage = () => {
  const { orderId } = useParams()
  const { user, isRole } = useAuth()
  const [tracking, setTracking] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [trackData, orderData] = await Promise.all([
          api.get(`/orders/${orderId}/track`),
          api.get(`/orders/${orderId}`),
        ])
        setTracking(trackData)
        setOrder(orderData)
      } catch (error) {
        if (error.status === 404) {
          setNotFound(true)
        } else {
          console.error('Error fetching order:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchData()
    }
  }, [orderId])

  const getOrderProgress = () => {
    const stages = ['pending', 'processing', 'shipped', 'delivered']
    const currentIndex = stages.indexOf(tracking?.status?.toLowerCase())
    if (currentIndex === -1) return 0
    return (currentIndex / (stages.length - 1)) * 100
  }

  if (loading) return <LoadingSpinner />

  if (notFound || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find an order with that ID.</p>
        <Link to="/orders" className="text-blue-600 hover:text-orange-600">
          View My Orders →
        </Link>
      </div>
    )
  }

  const stages = ['Pending', 'Processing', 'Shipped', 'Delivered']
  const currentStage = stages.findIndex(s => s.toLowerCase() === tracking?.status?.toLowerCase())

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
      <p className="text-gray-500 mb-8">Order #{order.id.slice(0, 8)}</p>

      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="relative mb-8">
          <div className="h-1 bg-gray-200 rounded-full">
            <div className="h-1 bg-orange-600 rounded-full transition-all duration-500" style={{ width: `${getOrderProgress()}%` }}></div>
          </div>
          <div className="flex justify-between mt-2">
            {stages.map((stage, idx) => (
              <div key={stage} className="text-center">
                <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                  idx <= currentStage ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx <= currentStage ? '✓' : idx + 1}
                </div>
                <span className={`text-xs ${idx <= currentStage ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                  {stage}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Tracking Information</h3>
          <p className="text-sm">Tracking Number: <span className="font-mono">{tracking?.tracking_number}</span></p>
          {tracking?.expected_delivery_date && (
            <p className="text-sm mt-1">Expected Delivery: {formatDate(tracking.expected_delivery_date)}</p>
          )}
          {tracking?.driver_name && (
            <p className="text-sm mt-1">Driver: {tracking.driver_name}</p>
          )}
          {tracking?.status === 'shipped' && (
            <p className="text-sm text-blue-600 mt-2">Your order is on the way!</p>
          )}
          {tracking?.status === 'delivered' && (
            <p className="text-sm text-green-600 mt-2">Your order has been delivered. Thank you for shopping with FORZA!</p>
          )}
        </div>

        {/* Driver Location Map Placeholder */}
        {tracking?.driver_location && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Driver Location</h3>
            <p className="text-sm">
              Driver is currently at: {tracking.driver_location.latitude.toFixed(4)}, {tracking.driver_location.longitude.toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {formatDate(tracking.driver_location.recorded_at)}
            </p>
            {/* Add map integration here if desired */}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-3">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.products?.name} x{item.quantity}</span>
              <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">Payment Method: {order.payment_method?.replace('_', ' ')}</p>
          <p className="text-sm text-gray-500 mt-1">Order Date: {formatDate(order.order_date)}</p>
          {order.shipping_address && (
            <p className="text-sm text-gray-500 mt-1">Shipping Address: {order.shipping_address}</p>
          )}
        </div>

        {/* Cancel Button for pending/processing orders */}
        {['pending', 'processing'].includes(order.status?.toLowerCase()) && (
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to cancel this order?')) {
                try {
                  await api.put(`/orders/${order.id}/cancel`)
                  window.location.reload()
                } catch (error) {
                  alert(error.message)
                }
              }
            }}
            className="mt-4 text-red-600 text-sm hover:underline"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  )
}

export default TrackOrderPage