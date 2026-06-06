import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Search, Menu, X, Sun, Moon } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { motion, AnimatePresence } from 'framer-motion'
import CompanyLogo from './CompanyLogo'
import { getSiteSettings } from '../../lib/siteSettings'

export default function Navbar() {
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: settings } = useQuery({ queryKey:['site-settings'], queryFn:getSiteSettings, retry:1, staleTime:60_000 })
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
    return 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (searchParams.get('focus_search') === 'true' && searchInputRef.current) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-primary/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-lg transition-all duration-300">
      {/* Top bar */}
      <div className="bg-primary-dark/40 border-b border-white/5 text-xs text-navy-200 py-2 px-4 text-center hidden md:block">
        🏭 Established in {settings?.founded_year || 2017} | 🔧 {settings?.company_description || 'Industrial Tools, Machinery & Hardware Solutions'} | 🏆 Trusted by Contractors, Workshops & Industries
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center hover:scale-102 transition-transform duration-200" aria-label="PMTC home">
            <CompanyLogo className="h-10 sm:h-12 w-auto rounded bg-white/95 p-1 border border-white/20 shadow-sm" />
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools, machines, brands…"
                className="w-full bg-white/5 text-white placeholder-navy-200 border border-white/10 rounded-full pl-5 pr-12 py-2.5 text-sm focus:outline-none focus:bg-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 shadow-inner"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-200 group-hover:text-white group-focus-within:text-accent transition-colors duration-200">
                <Search size={18} className="group-hover:rotate-6 transition-transform" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Nav links — desktop */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              {[
                ['/products', 'Products'],
                ['/categories', 'Categories'],
                ['/contact', 'Contact']
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="text-navy-100 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-200 relative after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-accent after:scale-x-0 after:hover:scale-x-100 after:origin-left after:transition-transform after:duration-300"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-navy-200 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 flex items-center justify-center"
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 text-navy-200 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 group">
              <ShoppingCart size={22} className="group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md shadow-accent/40 animate-pulse-soft">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-navy-200 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar Row */}
      <div className="md:hidden px-4 pb-4 pt-1 border-t border-white/5 bg-primary/90">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools, machines, brands…"
              className="w-full bg-white/5 text-white placeholder-navy-200 border border-white/10 rounded-full pl-5 pr-12 py-2.5 text-sm focus:outline-none focus:bg-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 shadow-inner"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-200 hover:text-white transition-colors">
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-navigation-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-dark border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {[['/', 'Home'], ['/products', 'Products'], ['/categories', 'Categories'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link 
                  key={to} 
                  to={to} 
                  onClick={() => setMenuOpen(false)} 
                  className="block text-navy-200 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
