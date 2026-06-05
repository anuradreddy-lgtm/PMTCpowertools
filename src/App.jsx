import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider, useAuth } from './hooks/useAuth'
import { CartProvider } from './hooks/useCart'

// Customer pages
const Home          = lazy(() => import('./pages/customer/Home'))
const Products      = lazy(() => import('./pages/customer/Products'))
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'))
const Categories    = lazy(() => import('./pages/customer/Categories'))
const Cart          = lazy(() => import('./pages/customer/Cart'))
const Search        = lazy(() => import('./pages/customer/Search'))
const Contact       = lazy(() => import('./pages/customer/Contact'))

// Admin pages
const AdminLogin         = lazy(() => import('./pages/admin/AdminLogin'))
const AdminProducts      = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders        = lazy(() => import('./pages/admin/AdminOrders'))
const AdminCategories    = lazy(() => import('./pages/admin/AdminCategories'))
const AdminBrands        = lazy(() => import('./pages/admin/AdminBrands'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const AdminSettings      = lazy(() => import('./pages/admin/AdminSettings'))

import CustomerLayout from './components/shared/CustomerLayout'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
})

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>
  if (!user)    return <Navigate to="/admin-login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public customer */}
      <Route element={<CustomerLayout />}>
        <Route path="/"                element={<Home />} />
        <Route path="/products"        element={<Products />} />
        <Route path="/products/:slug"  element={<ProductDetail />} />
        <Route path="/categories"      element={<Categories />} />
        <Route path="/cart"            element={<Cart />} />
        <Route path="/search"          element={<Search />} />
        <Route path="/contact"         element={<Contact />} />
      </Route>
      {/* Admin */}
      <Route path="/admin-login"             element={<AdminLogin />} />
      <Route path="/admin"                   element={<Navigate to="/admin/orders" replace />} />
      <Route path="/admin/products"          element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/orders"            element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/categories"        element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path="/admin/brands"            element={<AdminRoute><AdminBrands /></AdminRoute>} />
      <Route path="/admin/notifications"     element={<AdminRoute><AdminNotifications /></AdminRoute>} />
      <Route path="/admin/settings"          element={<AdminRoute><AdminSettings /></AdminRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>}>
              <AppRoutes />
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '10px', fontSize: '14px' }
              }}
            />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
