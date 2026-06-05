import { NavLink, useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, Tag, Tags, Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import CompanyLogo from '../shared/CompanyLogo'

const links = [
  { to:'/admin/products',      icon:Package,         label:'Products' },
  { to:'/admin/orders',        icon:ShoppingCart,    label:'Customer Enquiries' },
  { to:'/admin/categories',    icon:Tag,             label:'Categories' },
  { to:'/admin/brands',        icon:Tags,            label:'Brands' },
  { to:'/admin/settings',      icon:Settings,        label:'Settings' },
]

export default function AdminSidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/admin-login')
  }

  return (
    <aside className="w-64 min-h-screen bg-primary flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <CompanyLogo className="h-16 w-auto rounded bg-white/95" />
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
          <NavLink key={to} to={to}
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
    </aside>
  )
}
