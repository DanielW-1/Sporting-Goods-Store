import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const { user, profile } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      setCartCount(0)
      return
    }

    setLoading(true)
    try {
      const items = await api.get('/cart')
      setCartItems(items)
      const count = items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) throw new Error('Please login to add items to cart')

    // Optimistic update — increment count immediately so UI feels instant
    setCartCount(prev => prev + quantity)

    try {
      await api.post('/cart', { product_id: productId, quantity })
      await fetchCart() // Sync real state in background
    } catch (error) {
      setCartCount(prev => prev - quantity) // Revert on failure
      throw error
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity === 0) {
        await api.delete(`/cart/${itemId}`)
      } else {
        await api.put(`/cart/${itemId}`, { quantity })
      }
      await fetchCart()
    } catch (error) {
      throw error
    }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`)
      await fetchCart()
    } catch (error) {
      throw error
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      await fetchCart()
    } catch (error) {
      throw error
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      let price = item.products?.price || 0
      if (item.products?.active_discount) {
        price = price * (1 - item.products.active_discount.percentage / 100)
      }
      return sum + price * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartTotal,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}