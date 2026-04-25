import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StarRating from './StarRating'

const ProductCard = ({ product }) => {
  const { addToCart, cartCount, setCartCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [showAdded, setShowAdded] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    setShowAdded(true)
    setTimeout(() => setShowAdded(false), 1500)
    try {
      await addToCart(product.id, 1)
    } catch (err) {
      alert(err.message)
    } finally {
      setAdding(false)
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
          src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'}
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
        {product.sponsor_name && (
          <span className="absolute top-3 right-3 bg-navy-800/80 text-white text-[9px] font-bold uppercase px-2 py-1">
            Sponsored
          </span>
        )}
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
            disabled={adding}
            className={`px-3 h-9 text-xs font-bold uppercase tracking-wide transition-colors ${
              showAdded
                ? 'bg-green-600 text-white'
                : 'bg-navy-800 hover:bg-orange-600 text-white'
            }`}
          >
            {showAdded ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
