import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home, Grid, Search, ShoppingCart, Phone, MapPin } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { getSiteSettings } from '../../lib/siteSettings'
import Navbar from './Navbar'
import Footer from './Footer'

export default function CustomerLayout() {
  const location = useLocation()
  const { totalItems } = useCart()
  
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    retry: 1,
    staleTime: 60_000,
  })

  const rawPhone = settings?.whatsapp_number || settings?.phone_number || '9397914866'
  const cleanPhone = rawPhone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Hi PMTC, I\'d like to enquire about some industrial tools/machinery.')}`
  const phoneUrl = `tel:${cleanPhone}`

  // Bottom navigation items
  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Categories', icon: Grid, to: '/categories' },
    { label: 'Search', icon: Search, to: '/products?focus_search=true' },
    { label: 'Cart', icon: ShoppingCart, to: '/cart', badge: totalItems },
    { label: 'Contact', icon: Phone, to: '/contact' },
  ]

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      {/* Page Content */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />

      {/* Mobile Bottom Navigation (fixed at bottom, visible only on small screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 md:hidden flex justify-around items-center py-2 shadow-2xl safe-bottom transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
          
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-200 ${
                isActive ? 'text-accent font-bold scale-102' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={`${isActive ? 'scale-110 text-accent' : 'text-gray-500'} transition-transform duration-200`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-accent text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-sm animate-pulse-soft">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-wide font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Floating Action Buttons (WhatsApp & Call) */}
      <div className="fixed bottom-20 md:bottom-8 right-4 z-40 flex flex-col gap-3 transition-all duration-300">
        {/* Google Maps Location Button */}
        <a
          href="https://maps.app.goo.gl/yiKAUNrANrCxacvT6?g_st=ac"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 md:w-14 md:h-14 bg-[#EA4335] hover:bg-[#d93025] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-108 active:scale-95 transition-all duration-300 group"
          aria-label="View Location on Google Maps"
        >
          <MapPin size={22} className="md:size-24 group-hover:-translate-y-1 transition-transform duration-300" />
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-108 active:scale-95 transition-all duration-300 group"
          aria-label="Enquire via WhatsApp"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-6 h-6 md:w-7 md:h-7 fill-current group-hover:rotate-12 transition-transform duration-300"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.421 1.46h.005c5.454 0 9.895-4.442 9.9-9.9.003-2.646-1.02-5.132-2.883-6.995C17.22 1.86 14.734.834 12.09.833c-5.46 0-9.902 4.442-9.907 9.9-.001 1.932.504 3.82 1.463 5.418L2.68 21.03l4.967-1.303l-.001-.001-.002-.001zm11.558-7.393c-.3-.15-1.774-.875-2.049-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-1.04-.52-1.777-.92-2.525-1.6c-.53-.483-.872-1.03-1.022-1.282c-.15-.25-.016-.385.109-.51c.112-.112.25-.292.375-.438.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.45-.06-.15-.475-1.146-.65-1.567-.172-.413-.343-.357-.475-.364-.12-.007-.26-.008-.4-.008s-.37.05-.56.26c-.19.21-.72.7-.72 1.71c0 1.01.73 1.99.83 2.13c.1.14 1.44 2.2 3.49 3.08c.49.21.87.33 1.17.43c.49.15.94.13 1.29.08c.39-.06 1.774-.725 2.024-1.392c.25-.667.25-1.238.175-1.353c-.075-.115-.275-.19-.575-.34z" />
          </svg>
        </a>

        {/* Click-to-Call Button */}
        <a
          href={phoneUrl}
          className="w-12 h-12 md:w-14 md:h-14 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-xl hover:scale-108 active:scale-95 transition-all duration-300 group"
          aria-label="Call Shop"
        >
          <Phone size={20} className="md:size-22 group-hover:rotate-12 transition-transform duration-300" />
        </a>
      </div>
    </div>
  )
}
