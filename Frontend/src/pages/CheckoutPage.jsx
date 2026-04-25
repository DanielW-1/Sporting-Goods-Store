import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'


const CheckoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, getCartTotal, clearCart , loading } = useCart()
  const { profile } = useAuth()

  // "Buy Now" single item passed via location state
  const buyNowItem = location.state?.buyNowItem || null

  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [useRewardPoints, setUseRewardPoints] = useState(false)
  const [useDiscountPoints, setUseDiscountPoints] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingAddress, setShippingAddress] = useState(profile?.address || '')
  const [notes, setNotes] = useState('')
  const [cardData, setCardData] = useState({
    card_number: '',
    card_name: '',
    expiry: '',
    cvv: '',
  })
  const [cardErrors, setCardErrors] = useState({})

  // Items to display — either single buy-now item or full cart
  const displayItems = buyNowItem
    ? [{ id: 'buynow', quantity: buyNowItem.quantity, products: buyNowItem.product, price_at_purchase: buyNowItem.price }]
    : cartItems

  const subtotal = buyNowItem
    ? buyNowItem.price * buyNowItem.quantity
    : getCartTotal()

  const shipping = subtotal > 299 ? 0 : 15
  const tax = subtotal * 0.11
  const total = subtotal + shipping + tax

  const validateCard = () => {
    if (paymentMethod === 'cash_on_delivery') return true
    const errs = {}
    const rawNum = cardData.card_number.replace(/\s/g, '')
    if (!rawNum || rawNum.length < 16) errs.card_number = 'Enter a valid 16-digit card number'
    if (!cardData.card_name.trim()) errs.card_name = 'Name on card is required'
    if (!cardData.expiry.match(/^\d{2}\/\d{2}$/)) errs.expiry = 'Use MM/YY format'
    if (!cardData.cvv.match(/^\d{3,4}$/)) errs.cvv = 'Enter valid CVV'
    setCardErrors(errs)
    return Object.keys(errs).length === 0
  }

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const handlePlaceOrder = async () => {
    if (!validateCard()) return
    setIsProcessing(true)
    try {
      const payload = {
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes: notes || undefined,
        use_reward_points: useRewardPoints,
        use_discount_points: useDiscountPoints,
      }

      // If buy-now, include single item override
      if (buyNowItem) {
        payload.buy_now = {
          product_id: buyNowItem.product.id,
          quantity: buyNowItem.quantity,
          price: buyNowItem.price,
        }
      }

      const order = await api.post('/orders', payload)
      if (!buyNowItem) clearCart()
      navigate(`/orders/${order.id}`, { state: { fromCheckout: true } })
    } catch (error) {
      alert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

 if (!buyNowItem && !loading && cartItems.length === 0) {
  navigate('/cart')
  return null
}

if (!buyNowItem && loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Shipping */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address *</label>
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
                  placeholder="Special delivery instructions..."
                  className="input-field"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
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
                    <span className="font-semibold capitalize">{method.replace(/_/g, ' ')}</span>
                    <p className="text-xs text-gray-500">
                      {method === 'cash_on_delivery' ? 'Pay when you receive your order' : 'Secure payment via encrypted gateway'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Credit/Debit Card Fields */}
            {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
              <div className="mt-5 border-t pt-5 space-y-4">
                <h4 className="font-semibold text-sm">Card Details</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number *</label>
                  <input
                    type="text"
                    value={cardData.card_number}
                    onChange={(e) => setCardData({ ...cardData, card_number: formatCardNumber(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="input-field font-mono"
                  />
                  {cardErrors.card_number && <p className="text-red-500 text-xs mt-1">{cardErrors.card_number}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name on Card *</label>
                  <input
                    type="text"
                    value={cardData.card_name}
                    onChange={(e) => setCardData({ ...cardData, card_name: e.target.value })}
                    placeholder="Full name as on card"
                    className="input-field"
                  />
                  {cardErrors.card_name && <p className="text-red-500 text-xs mt-1">{cardErrors.card_name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="input-field"
                    />
                    {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV *</label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="123"
                      maxLength={4}
                      className="input-field"
                    />
                    {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                  </div>
                </div>
                <p className="text-xs text-gray-400">Your card information is encrypted and never stored.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            {buyNowItem && (
              <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 font-semibold uppercase tracking-wide">
                Single Item Purchase
              </div>
            )}

            <div className="space-y-2 text-sm max-h-64 overflow-y-auto mb-4">
              {displayItems.map((item, idx) => {
                const price = item.products?.active_discount
                  ? item.products.price * (1 - item.products.active_discount.percentage / 100)
                  : item.products?.price || item.price_at_purchase || 0
                return (
                  <div key={item.id || idx} className="flex justify-between">
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
                <span>Apply reward points ({profile.reward_points} pts available)</span>
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
                <span>Apply discount points ({profile.discount_points} pts available)</span>
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
