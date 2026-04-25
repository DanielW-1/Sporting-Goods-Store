import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/utils'

const POSPage = () => {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search.trim()) fetchProducts()
      else setProducts([])
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const fetchProducts = async () => {
    try {
      const data = await api.get(`/products?search=${encodeURIComponent(search)}&limit=20`)
      setProducts(data.products || [])
    } catch (err) {
      console.error(err)
    }
  }

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId)
    setCart(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i))
  }

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.product_id !== productId))

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty')
    setLoading(true)
    try {
      const result = await api.post('/instore/purchase', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        customer_email: customerEmail || undefined,
        payment_method: paymentMethod,
      })
      setReceipt(result.receipt)
      setCart([])
      setCustomerEmail('')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (receipt) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✓</div>
            <h2 className="text-2xl font-bold text-green-600">Sale Complete</h2>
            <p className="text-gray-500 text-sm mt-1">Order #{receipt.order_id?.slice(0, 8)}</p>
          </div>
          <div className="border-t border-b border-gray-200 py-4 mb-4 space-y-2">
            {receipt.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg mb-2">
            <span>Total</span>
            <span>{formatPrice(receipt.total)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Payment: {receipt.payment_method?.replace(/_/g, ' ')}</p>
          <p className="text-sm text-gray-500">Served by: {receipt.served_by}</p>
          {receipt.customer_email !== 'Guest' && (
            <p className="text-sm text-gray-500">Customer: {receipt.customer_email}</p>
          )}
          <button onClick={() => setReceipt(null)} className="mt-6 w-full bg-orange-600 text-white py-2 rounded font-semibold">
            New Sale
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Point of Sale</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
          />
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {products.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.brand} · Stock: {p.stock_quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatPrice(p.price)}</span>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock_quantity === 0}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
            {search && products.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No products found</p>
            )}
            {!search && (
              <p className="text-gray-400 text-sm text-center py-8">Search for a product to begin</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Current Sale</h2>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm flex-1 flex items-center justify-center">No items added</p>
          ) : (
            <div className="flex-1 space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.product_id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="w-6 h-6 border rounded text-sm">-</button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="w-6 h-6 border rounded text-sm">+</button>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 text-xs ml-2">✕</button>
                  </div>
                  <span className="ml-3 font-medium text-sm w-16 text-right">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <input
              type="email"
              placeholder="Customer email (optional)"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="cash_on_delivery">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
            </select>
            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full bg-orange-600 text-white py-3 rounded font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default POSPage
