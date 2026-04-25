import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../lib/api'

const HomePage = () => {
  const { user, profile } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('Football')
  const [sponsoredProducts, setSponsoredProducts] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loadingSponsored, setLoadingSponsored] = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(false)

  useEffect(() => {
    const fetchSponsored = async () => {
      try {
        const data = await api.get('/products/sponsored')
        setSponsoredProducts(data)
      } catch (error) {
        console.error('Error fetching sponsored:', error)
      } finally {
        setLoadingSponsored(false)
      }
    }
    fetchSponsored()
  }, [])

  useEffect(() => {
    if (user) {
      const fetchRecommendations = async () => {
        setLoadingRecs(true)
        try {
          const data = await api.get('/recommendations')
          setRecommendations(data)
        } catch (error) {
          console.error('Error fetching recommendations:', error)
        } finally {
          setLoadingRecs(false)
        }
      }
      fetchRecommendations()
    }
  }, [user])

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 p-4 bg-gray-100">
        <div className="lg:col-span-2 relative overflow-hidden group cursor-pointer h-96">
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1400&h=700&fit=crop"
            alt="Hero"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-800/90 via-navy-800/50 to-transparent flex flex-col justify-end p-8">
            <div className="flex items-center gap-2 text-orange-600 text-[11px] font-bold uppercase tracking-wider mb-2">
              <div className="w-6 h-0.5 bg-orange-600"></div>
              Spring 2026 Collection
            </div>
            <h1 className="font-bebas text-5xl md:text-7xl text-white leading-none mb-3">
              Built for<br /><span className="text-orange-600">Victory</span>
            </h1>
            <p className="text-white/60 text-sm max-w-md mb-5">
              Professional-grade sporting equipment for every discipline. Trusted by athletes across Lebanon and beyond.
            </p>
            <div className="flex gap-3">
              <Link to="/products" className="bg-orange-600 text-white px-6 py-3 font-bold uppercase text-sm hover:bg-orange-700 transition">
                Shop Collection
              </Link>
              <Link to="/products?onSale=true" className="border-2 border-white/30 text-white px-6 py-3 font-bold uppercase text-sm hover:border-white/70 transition">
                View Sales
              </Link>
            </div>
          </div>
        </div>
        <Link to="/products?category=Fitness" className="relative overflow-hidden group cursor-pointer h-96 block">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-800/80 to-transparent flex flex-col justify-end p-5">
            <div className="text-orange-600 text-[10px] font-bold uppercase">Up to 40% off</div>
            <div className="font-bebas text-2xl text-white">Fitness Deals</div>
            <div className="text-white/50 text-xs">Weights, machines & more</div>
          </div>
        </Link>
      </div>

      {/* Promo Bar */}
      <div className="bg-navy-800 flex flex-wrap border-t-3 border-orange-600">
        {[
          {
            icon: <svg className="w-6 h-6 stroke-orange-400" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M5 8h14l-1 9H6L5 8z"/><path d="M9 8V5a3 3 0 016 0v3"/></svg>,
            title: "Free Delivery", desc: "On orders over $299"
          },
          {
            icon: <svg className="w-6 h-6 stroke-orange-400" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4"/></svg>,
            title: "Free Returns", desc: "30-day hassle-free returns"
          },
          {
            icon: <svg className="w-6 h-6 stroke-orange-400" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
            title: "Secure Checkout", desc: "PCI DSS compliant payments"
          },
          {
            icon: <svg className="w-6 h-6 stroke-orange-400" viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
            title: "24/7 Support", desc: "AI chatbot + live agents"
          },
        ].map((item, idx) => (
          <div key={idx} className="flex-1 flex items-center gap-3 p-3 border-r border-white/5 last:border-none">
            {item.icon}
            <div><strong className="block text-sm text-white/80">{item.title}</strong><span className="text-[11px] text-white/40">{item.desc}</span></div>
          </div>
        ))}
      </div>

      {/* Sponsored Section */}
      {!loadingSponsored && sponsoredProducts.length > 0 && (
        <div className="bg-white py-8 px-8 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl text-navy-800 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-600"></div>
              Sponsored
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sponsoredProducts.slice(0, 4).map(product => (
              <ProductCard key={product.product_id} product={{
                id: product.product_id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image_url: product.image_url,
                avg_rating: product.avg_rating,
                sponsor_name: product.sponsor_name,
              }} />
            ))}
          </div>
        </div>
      )}

      <CategoryBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {/* Personalized Recommendations */}
      {user && (
        <div className="px-8 py-10 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bebas text-3xl text-navy-800 flex items-center gap-2">
              <div className="w-1.5 h-7 bg-orange-600"></div>
              Recommended For You
            </h2>
          </div>
          {loadingRecs ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rewards Banner */}
      <div className="bg-navy-800 mx-8 mb-10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 items-center">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-[10px] font-bold uppercase tracking-wider mb-2">
              <div className="w-5 h-0.5 bg-orange-600"></div>
              Loyalty Program
            </div>
            <h2 className="font-bebas text-4xl text-white leading-tight">
              Earn Points.<br /><span className="text-orange-600">Get Rewarded.</span>
            </h2>
            <p className="text-white/50 text-sm mt-2">
              Every purchase earns reward points redeemable for discounts.
            </p>
          </div>
          <div className="flex justify-around">
            <div><div className="font-bebas text-3xl text-white">1pt</div><div className="text-[11px] text-white/40">per $1 spent</div></div>
            <div><div className="font-bebas text-3xl text-white">$5</div><div className="text-[11px] text-white/40">per 100 pts</div></div>
          </div>
          <Link to={user ? "/account" : "/register"} className="bg-orange-600 text-white text-center px-6 py-3 font-bold uppercase text-sm hover:bg-orange-700 transition">
            {user ? 'View Your Points →' : 'Join Free →'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage