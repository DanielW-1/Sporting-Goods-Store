import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const CartPage = () => {
  const { cartItems, loading, removeItem, updateQuantity, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const subtotal = getCartTotal()
  const shipping = subtotal > 299 ? 0 : 15
  const tax = subtotal * 0.11
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
    } else {
      navigate('/checkout')
    }
  }

  if (loading) return <LoadingSpinner />

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
        <Link to="/products" className="bg-orange-600 text-white px-6 py-3 font-bold uppercase inline-block hover:bg-orange-700">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-semibold text-sm">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            {cartItems.map(item => {
              const price = item.products?.active_discount
                ? item.products.price * (1 - item.products.active_discount.percentage / 100)
                : item.products?.price || 0
              const itemTotal = price * item.quantity

              return (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-t border-gray-200 items-center">
                  <div className="md:col-span-6 flex gap-4">
                    <img src={item.products?.image_url || 'https://via.placeholder.com/80'} alt={item.products?.name} className="w-20 h-20 object-cover rounded" />
                    <div>
                      <h3 className="font-semibold">{item.products?.name}</h3>
                      <p className="text-sm text-gray-500">{item.products?.brand}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 mt-1 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-center">
                    <span className="font-semibold">${price.toFixed(2)}</span>
                  </div>
                  <div className="md:col-span-2 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-center font-semibold">
                    ${itemTotal.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex justify-between">
            <Link to="/products" className="text-blue-600 hover:text-orange-600">
              ← Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-red-500 hover:underline text-sm">
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <div className="text-xs text-gray-500 pt-1">
                  Add ${(299 - subtotal).toFixed(2)} more for free shipping
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-orange-600 text-white py-3 font-bold uppercase mt-6 hover:bg-orange-700 transition"
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 flex justify-center gap-2 text-xs text-gray-400">
              <span>🔒 Secure Checkout</span>
              <span>|</span>
              <span>💳 PCI DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage