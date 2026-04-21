import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import SupportChat from './components/SupportChat'

// Public Pages
import HomePage from './pages/HomePage'
import ProductListingPage from './pages/ProductListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Customer Pages
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import TrackOrderPage from './pages/TrackOrderPage'
import SupportPage from './pages/SupportPage'
import SupportTicketPage from './pages/SupportTicketPage'

// Staff/Admin Pages
import InventoryPage from './pages/dashboard/InventoryPage'
import POSPage from './pages/dashboard/POSPage'
import SupportDashboardPage from './pages/dashboard/SupportDashboardPage'
import DeliveriesPage from './pages/dashboard/DeliveriesPage'
import EmployeesPage from './pages/dashboard/EmployeesPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import AdminPage from './pages/dashboard/AdminPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Customer */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
                <Route path="/track/:orderId" element={<TrackOrderPage />} />
                <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                <Route path="/support/tickets/:id" element={<ProtectedRoute><SupportTicketPage /></ProtectedRoute>} />

                {/* Staff/Admin */}
                <Route path="/dashboard/inventory" element={<ProtectedRoute roles={['staff', 'inventory_staff', 'manager', 'admin']}><InventoryPage /></ProtectedRoute>} />
                <Route path="/dashboard/pos" element={<ProtectedRoute roles={['staff', 'manager', 'admin']}><POSPage /></ProtectedRoute>} />
                <Route path="/dashboard/support" element={<ProtectedRoute roles={['support_staff', 'manager', 'admin']}><SupportDashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard/deliveries" element={<ProtectedRoute roles={['driver']}><DeliveriesPage /></ProtectedRoute>} />
                <Route path="/dashboard/employees" element={<ProtectedRoute roles={['manager', 'admin']}><EmployeesPage /></ProtectedRoute>} />
                <Route path="/dashboard/analytics" element={<ProtectedRoute roles={['manager', 'admin']}><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
              </Routes>
            </main>
            <SupportChat />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App