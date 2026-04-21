import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { profile } = useAuth()

  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [useRewardPoints, setUseRewardPoints] = useState(false)
  const [useDiscountPoints, setUseDiscountPoints] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingAddress, setShippingAddress] = useState(profile?.address || '')
  const [notes, setNotes] = useState('')

  const subtotal = getCartTotal()
  const shipping = subtotal > 299 ? 0 : 15
  const tax = subtotal * 0.11
  let total = subtotal + shipping + tax

  // Calculate points discounts (these would be actual API calculations)
  // For now, just UI placeholders

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    try {
      const order = await api.post('/orders', {
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes: notes || undefined,
        use_reward_points: useRewardPoints,
        use_discount_points: useDiscountPoints,
      })
      clearCart()
      navigate(`/orders/${order.id}`)
    } catch (error) {
      alert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="input-field"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special delivery instructions or notes..."
                  className="input-field"
                  rows="2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Payment Method</h3>
            <div className="space-y-3">
              {['credit_card', 'debit_card', 'cash_on_delivery'].map(method => (
                <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold capitalize">
                      {method.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {method === 'cash_on_delivery' ? 'Pay when you receive your order' : 'Secure payment via encrypted gateway'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-96">
          <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm max-h-64 overflow-y-auto mb-4">
              {cartItems.map(item => {
                const price = item.products?.active_discount
                  ? item.products.price * (1 - item.products.active_discount.percentage / 100)
                  : item.products?.price || 0
                return (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.products?.name} x{item.quantity}</span>
                    <span>${(price * item.quantity).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (11%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {profile && profile.reward_points > 0 && (
              <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRewardPoints}
                  onChange={(e) => setUseRewardPoints(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Apply reward points ({profile.reward_points} points available)</span>
              </label>
            )}

            {profile && profile.discount_points > 0 && (
              <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDiscountPoints}
                  onChange={(e) => setUseDiscountPoints(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Apply discount points ({profile.discount_points} points available)</span>
              </label>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 font-bold uppercase mt-6 hover:bg-orange-700 transition disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage