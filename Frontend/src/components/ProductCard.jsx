import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StarRating from './StarRating'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [showAdded, setShowAdded] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      window.location.href = '/login'
      return
    }
    try {
      await addToCart(product.id, 1)
      setShowAdded(true)
      setTimeout(() => setShowAdded(false), 1500)
    } catch (err) {
      alert(err.message)
    }
  }

  const hasDiscount = product.active_discount
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.active_discount.percentage / 100)
    : null

  return (
    <Link to={`/product/${product.id}`} className="group bg-white block transition-shadow hover:shadow-xl border border-transparent hover:border-blue-100">
      <div className="relative overflow-hidden h-56 bg-gray-100">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x300'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-orange-600 text-white text-[10px] font-bold uppercase px-2 py-1">
              -{product.active_discount.percentage}%
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="text-blue-600 font-barlow-condensed text-[10px] font-bold uppercase tracking-wide">{product.brand}</div>
        <h3 className="font-barlow-condensed font-bold text-base text-navy-800 mt-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 mt-2">
          <StarRating rating={product.avg_rating || 0} size="sm" />
          <span className="text-[11px] text-gray-400 ml-1">({product.review_count || 0})</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            {hasDiscount ? (
              <>
                <span className="text-sm text-gray-400 line-through mr-1">${product.price}</span>
                <span className="font-bebas text-2xl text-orange-600">${discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-bebas text-2xl text-navy-800">${product.price}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 bg-navy-800 hover:bg-orange-600 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
      {showAdded && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold animate-fade-in z-50">
          Added to cart!
        </div>
      )}
    </Link>
  )
}

export default ProductCard