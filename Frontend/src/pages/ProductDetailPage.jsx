import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../lib/api'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const [productData, reviewsData] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`),
        ])
        setProduct(productData)
        setReviews(reviewsData)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (user && product) {
      const checkPurchase = async () => {
        try {
          const orders = await api.get('/orders')
          const hasOrder = orders.some(order =>
            order.status === 'delivered' &&
            order.order_items?.some(item => item.product_id === product.id)
          )
          setHasPurchased(hasOrder)
        } catch (error) {
          console.error('Error checking purchase:', error)
        }
      }
      checkPurchase()
    }
  }, [user, product])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await addToCart(product.id, quantity)
      alert('Added to cart!')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setSubmittingReview(true)
    try {
      await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment,
      })
      const newReviews = await api.get(`/products/${id}/reviews`)
      setReviews(newReviews)
      setShowReviewForm(false)
      setReviewComment('')
      setReviewRating(5)
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!product) {
    return <div className="text-center py-20">Product not found</div>
  }

  const hasDiscount = product.active_discount
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.active_discount.percentage / 100)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Images */}
          <div className="md:w-1/2">
            <div className="bg-gray-100 rounded-lg overflow-hidden h-96">
              <img src={product.image_url || 'https://via.placeholder.com/600x450'} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2">
            <div className="text-blue-600 text-sm font-bold uppercase tracking-wide">{product.brand}</div>
            <h1 className="text-3xl font-bold text-navy-800 mt-2">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={product.avg_rating || 0} />
              <span className="text-gray-500 text-sm">({product.review_count || 0} reviews)</span>
            </div>

            <div className="mt-4">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bebas text-orange-600">${discountedPrice.toFixed(2)}</span>
                  <span className="text-lg text-gray-400 line-through ml-2">${product.price}</span>
                  <span className="ml-2 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded">
                    Save ${(product.price - discountedPrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bebas text-navy-800">${product.price}</span>
              )}
            </div>

            <div className="mt-4 text-gray-600">
              <p>{product.description}</p>
            </div>

            <div className="mt-4">
              <label className="font-semibold text-sm block mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">{product.stock_quantity} in stock</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 bg-navy-800 text-white py-3 font-bold uppercase hover:bg-orange-600 transition">
                Add to Cart
              </button>
              <button className="px-6 py-3 border-2 border-navy-800 text-navy-800 font-bold uppercase hover:bg-navy-800 hover:text-white transition">
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Customer Reviews</h3>
            {user && hasPurchased && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="text-blue-600 hover:text-orange-600"
              >
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-3">Write your review</h4>
              <div className="mb-3">
                <label className="block text-sm mb-1">Rating</label>
                <StarRating rating={reviewRating} onRating={setReviewRating} interactive size="lg" />
              </div>
              <div className="mb-3">
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-navy-800 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button onClick={() => setShowReviewForm(false)} className="border border-gray-300 px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">
                      {review.profiles?.first_name} {review.profiles?.last_name}
                    </span>
                    <div className="flex mt-1">
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.review_date).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage