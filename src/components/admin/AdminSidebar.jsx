import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Tag, Tags, Settings, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import CompanyLogo from '../shared/CompanyLogo'

const links = [
  { to:'/admin/dashboard',     icon:LayoutDashboard, label:'Dashboard' },
  { to:'/admin/products',      icon:Package,         label:'Products' },
  { to:'/admin/orders',        icon:ShoppingCart,    label:'Customer Enquiries' },
  { to:'/admin/categories',    icon:Tag,             label:'Categories' },
  { to:'/admin/brands',        icon:Tags,            label:'Brands' },
  { to:'/admin/settings',      icon:Settings,        label:'Settings' },
]

export default function AdminSidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/admin-login')
  }

  const SidebarContent = () => (
    <>
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <CompanyLogo className="h-16 w-auto rounded bg-white/95" />
        <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-navy-200 hover:text-white transition-colors" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-white text-xs font-medium">{user?.full_name || 'Admin'}</p>
            <p className="text-navy-200 text-xs">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({to,icon:Icon,label}) => (
          <NavLink key={to} to={to} onClick={() => setIsOpen(false)}
            className={({isActive}) => `admin-sidebar-link ${isActive?'active':''}`}>
            <Icon size={18}/><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout} className="admin-sidebar-link w-full text-left hover:bg-red-500/20 hover:text-red-300">
          <LogOut size={18}/><span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden bg-primary h-16 px-4 flex items-center justify-between border-b border-white/10 text-white z-40 sticky top-0 w-full">
        <CompanyLogo className="h-10 w-auto rounded bg-white/95" />
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-navy-200 hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-primary z-50 flex flex-col md:hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar (standard) */}
      <aside className="hidden md:flex w-64 min-h-screen bg-primary flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>
    </>
  )
}
