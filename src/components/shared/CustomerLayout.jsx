import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home, Grid, Search, ShoppingCart, Phone, MessageSquare, MapPin } from 'lucide-react'
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
          <MessageSquare size={22} className="md:size-24 group-hover:rotate-12 transition-transform duration-300" />
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
