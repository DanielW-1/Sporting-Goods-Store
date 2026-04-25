import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const { user, profile, logout, isRole } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const getNavLinks = () => {
    const links = []

    if (isRole(['staff', 'inventory_staff', 'manager', 'admin'])) {
      links.push({ to: '/dashboard/inventory', label: 'Inventory' })
    }
    if (isRole(['staff', 'manager', 'admin'])) {
      links.push({ to: '/dashboard/pos', label: 'POS' })
    }
    if (isRole(['support_staff', 'manager', 'admin'])) {
      links.push({ to: '/dashboard/support', label: 'Support' })
    }
    if (isRole(['driver'])) {
      links.push({ to: '/dashboard/deliveries', label: 'Deliveries' })
    }
    if (isRole(['manager', 'admin'])) {
      links.push({ to: '/dashboard/employees', label: 'Employees' })
      links.push({ to: '/dashboard/analytics', label: 'Analytics' })
      links.push({ to: '/dashboard/suppliers', label: 'Suppliers' })
    }
    if (isRole(['admin'])) {
      links.push({ to: '/dashboard/admin', label: 'Admin' })
    }

    return links
  }

  return (
    <>
      <div className="bg-navy-800 text-white/60 text-xs py-2 px-8 flex justify-between">
        <span>
          <strong className="text-white/80">Free shipping</strong> on orders above $299 · Free 30-day returns
        </span>
        <div className="flex gap-5">
          <Link to="/orders" className="hover:text-white transition">Track Order</Link>
          <Link to="/support" className="hover:text-white transition">Support</Link>
          {!user ? (
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
          ) : (
            <button onClick={logout} className="hover:text-white transition">Sign Out</button>
          )}
        </div>
      </div>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center h-16 px-8 gap-5">
          <Link to="/" className="font-bebas text-3xl tracking-wide text-navy-800">
            FORZA<span className="text-orange-600">.</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md flex border border-gray-300 bg-gray-50 focus-within:border-blue-600 focus-within:bg-white">
            <input
              type="text"
              placeholder="Search sport, product or brand…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none px-4 h-10 text-sm"
            />
            <button type="submit" className="w-11 bg-blue-600 hover:bg-navy-800 flex items-center justify-center transition">
              <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2.2">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>
          </form>

          <div className="flex h-full ml-auto gap-1">
            {getNavLinks().map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-3 font-barlow-condensed font-bold text-xs uppercase text-gray-600 hover:text-blue-600 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-3">
            <Link to={user ? "/account" : "/login"} className="flex flex-col items-center px-2 py-1 rounded-full hover:bg-gray-100 transition">
              <svg className="w-5 h-5 stroke-gray-600" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Account</span>
            </Link>
            <Link to="/cart" className="relative flex flex-col items-center px-2 py-1 rounded-full hover:bg-gray-100 transition">
              {cartCount > 0 && (
                <span className="absolute -top-1 right-0 bg-orange-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <svg className="w-5 h-5 stroke-gray-600" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Cart</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar