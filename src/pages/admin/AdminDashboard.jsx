import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Package, 
  ShoppingCart, 
  Tag, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Plus, 
  Settings, 
  Eye, 
  X,
  FileText,
  Boxes
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell
} from 'recharts'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatCard from '../../components/admin/StatCard'
import { Products } from '../../lib/products'
import { Categories } from '../../lib/categories'
import { Brands } from '../../lib/brands'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)

  // 1. Fetch Orders (Enquiries)
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  // 2. Fetch Products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => Products.list(),
  })

  // 3. Fetch Categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => Categories.list(),
  })

  // 4. Fetch Brands
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => Brands.list(),
  })

  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingCategories || isLoadingBrands

  // Calculations
  const totalEnquiries = orders.length
  const newEnquiries = orders.filter(o => o.status === 'new').length
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.stock <= 5).length
  const activeProducts = products.filter(p => p.is_active).length

  // Recent 5 Enquiries
  const recentEnquiries = orders.slice(0, 5)

  // Chart 1: Enquiries Trend (Last 7 days)
  const getTrendData = () => {
    const data = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dateStr = date.toISOString().split('T')[0]
      
      const count = orders.filter(o => {
        if (!o.created_at) return false
        return o.created_at.startsWith(dateStr)
      }).length

      data.push({ name: label, Enquiries: count })
    }
    return data
  }

  // Chart 2: Products per Category
  const getCategoryData = () => {
    return categories.map(cat => {
      const count = products.filter(p => p.category_id === cat.id).length
      return {
        name: cat.name,
        count: count
      }
    }).filter(c => c.count > 0).slice(0, 6) // limit to top 6 categories
  }

  const trendData = getTrendData()
  const categoryData = getCategoryData()

  // Mock data for display if actual database has no entries
  const hasNoData = orders.length === 0 && products.length === 0
  const demoTrendData = [
    { name: 'Mon', Enquiries: 4 },
    { name: 'Tue', Enquiries: 3 },
    { name: 'Wed', Enquiries: 7 },
    { name: 'Thu', Enquiries: 5 },
    { name: 'Fri', Enquiries: 8 },
    { name: 'Sat', Enquiries: 2 },
    { name: 'Sun', Enquiries: 6 }
  ]
  const demoCategoryData = [
    { name: 'Power Tools', count: 12 },
    { name: 'Generators', count: 8 },
    { name: 'Welding', count: 5 },
    { name: 'Hand Tools', count: 15 },
    { name: 'Safety Gear', count: 9 }
  ]

  const statusBadge = {
    new: 'badge-warning',
    read: 'badge-success',
    pending: 'badge-warning',
    confirmed: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">PMTC Control Panel Overview</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/products" className="btn-outline px-4 py-2 text-sm flex items-center gap-1.5">
              <Plus size={16} /> Add Product
            </Link>
            <Link to="/admin/orders" className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
              <ShoppingCart size={16} /> View Enquiries
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Enquiries" 
            value={isLoading ? '...' : totalEnquiries} 
            icon={ShoppingCart} 
            color="blue"
          />
          <StatCard 
            title="New Enquiries" 
            value={isLoading ? '...' : newEnquiries} 
            icon={Clock} 
            color="orange"
          />
          <StatCard 
            title="Active Products" 
            value={isLoading ? '...' : `${activeProducts} / ${totalProducts}`} 
            icon={Package} 
            color="green"
          />
          <StatCard 
            title="Low Stock Warning" 
            value={isLoading ? '...' : lowStockProducts} 
            icon={AlertTriangle} 
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-gray-900">Enquiries Trend</h3>
                <p className="text-gray-500 text-xs mt-0.5">Volume of customer submissions (Last 7 days)</p>
              </div>
              {orders.length === 0 && (
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Demo Data</span>
              )}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orders.length > 0 ? trendData : demoTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '12px', color: '#F97316' }}
                  />
                  <Area type="monotone" dataKey="Enquiries" stroke="#F97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEnquiries)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-gray-900">Inventory by Category</h3>
                <p className="text-gray-500 text-xs mt-0.5">Product counts across categories</p>
              </div>
              {products.length === 0 && (
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Demo Data</span>
              )}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={products.length > 0 && categoryData.length > 0 ? categoryData : demoCategoryData} 
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  barSize={32}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '12px', color: '#1E3A5F' }}
                  />
                  <Bar dataKey="count" fill="#1E3A5F" radius={[4, 4, 0, 0]}>
                    {(products.length > 0 && categoryData.length > 0 ? categoryData : demoCategoryData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1E3A5F' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Enquiries */}
          <div className="card lg:col-span-2 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-gray-900">Recent Customer Enquiries</h3>
                <p className="text-gray-500 text-xs mt-0.5">Review the latest leads from the site</p>
              </div>
              <Link to="/admin/orders" className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Product / Inquiry</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading enquiries…</td>
                    </tr>
                  )}
                  {recentEnquiries.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{o.customer_name || 'Guest'}</p>
                        <p className="text-xs text-gray-400">{o.customer_phone || o.email || 'No contact info'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 line-clamp-1 max-w-xs">{o.product_name}</p>
                        <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[o.status] || 'badge-info'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedEnquiry(o)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg inline-flex"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && recentEnquiries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No enquiries found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & System Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-gray-900 mb-4">Quick Tasks</h3>
              <div className="space-y-2">
                <Link to="/admin/products" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-accent/30 hover:bg-orange-50/20 transition-all text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Inventory Items</p>
                    <p className="text-xs text-gray-400">Add or edit machinery listings</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link to="/admin/categories" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue/30 hover:bg-blue-50/20 transition-all text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Boxes size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Product Categories</p>
                    <p className="text-xs text-gray-400">Group tools and accessories</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link to="/admin/settings" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple/30 hover:bg-purple-50/20 transition-all text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Settings size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Portal Settings</p>
                    <p className="text-xs text-gray-400">Configure contact information</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Database / API Status */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">API Connection</span>
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Database Engine</span>
                  <span className="text-gray-800 font-medium">Supabase / Base44</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Environment</span>
                  <span className="text-gray-800 font-medium">Local Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enquiry Details Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelectedEnquiry(null)}>
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-auto">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-heading font-bold text-gray-900">Enquiry {selectedEnquiry.order_number}</h2>
                <button onClick={() => setSelectedEnquiry(null)}><X size={20} className="text-gray-400"/></button>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Customer Name</p>
                    <p className="font-medium text-gray-800">{selectedEnquiry.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Phone Number</p>
                    <p className="font-medium text-gray-800">{selectedEnquiry.customer_phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs mb-1">Email</p>
                    <p className="font-medium text-gray-800">{selectedEnquiry.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Status</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[selectedEnquiry.status] || 'badge-info'}`}>
                      {selectedEnquiry.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Quantity Requested</p>
                    <p className="font-medium text-gray-800">{selectedEnquiry.quantity ?? 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs mb-1">Product Details</p>
                    <p className="font-medium text-gray-800 whitespace-pre-wrap">{selectedEnquiry.product_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
