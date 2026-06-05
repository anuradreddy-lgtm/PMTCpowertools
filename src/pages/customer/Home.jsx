import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Truck, HeadphonesIcon, Award, Star, CheckCircle, ChevronRight, ChevronLeft, Wrench, Users, Package, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Products } from '../../lib/products'
import { Categories } from '../../lib/categories'
import { Brands } from '../../lib/brands'
import { getSiteSettings } from '../../lib/siteSettings'
import ProductCard from '../../components/shared/ProductCard'

const features = [
  { icon: Award,            title: 'Since 2017',                  desc: 'Serving industries, contractors and workshops for over 9 years.' },
  { icon: Shield,           title: 'Genuine Industrial Brands',   desc: 'Authorised dealer for Bosch, Makita, Ingco, Dongcheng and more.' },
  { icon: HeadphonesIcon,   title: 'Expert Support',              desc: 'Mon-Sun, 9AM-8PM' },
  { icon: Truck,            title: 'Trusted Industrial Supplier',  desc: 'Reliable machinery, tools and hardware supplies across Andhra Pradesh and Telangana.' },
]

const counters = [
  { value: '9+', label: 'Years Experience', desc: 'Serving since 2017', icon: Award },
  { value: '1,000+', label: 'Products Available', desc: 'Premium tools & machinery', icon: Package },
  { value: '500+', label: 'Happy Customers', desc: 'Contractors & workshops', icon: Users },
  { value: '50+', label: 'Industrial Brands', desc: 'Bosch, Makita, Ingco...', icon: Shield }
]

const testimonials = [
  { name: 'K. R. Rao', company: 'Rao Constructions', text: 'PMTC has been our go-to supplier for power tools and welding machinery since 2018. Outstanding service, 100% authentic products, and prompt delivery.', rating: 5 },
  { name: 'Srinivas Murthy', company: 'Murthy Auto Garage', text: 'We purchased our heavy-duty grinders and impact wrenches here. The durability of their tools is matched only by their expert support team.', rating: 5 },
  { name: 'A. Prasad Reddy', company: 'Reddy Engineering Works', text: 'Prompt delivery and very competitive GST invoices. Highly recommended for industrial workshops across Andhra Pradesh.', rating: 5 },
]

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => Products.list({ is_featured: true, is_active: true }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => Categories.list(),
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => Brands.list(),
  })

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    retry: 1,
    staleTime: 60_000,
  })

  const activeBrands = brands.filter((brand) => brand.is_active !== false)

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">

      {/* Hero Section Redesign */}
      <section className="bg-blueprint relative overflow-hidden py-16 lg:py-24 border-b border-white/10">
        {/* Soft Radial Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary-light/25 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and Details */}
            <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.7 }}
              >
                <span className="inline-flex items-center gap-1.5 bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6 animate-pulse-soft">
                  <Flame size={12} className="fill-accent animate-bounce" /> {settings?.company_name || 'Padma Mitra Trading Company'}
                </span>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6 tracking-tight">
                  Industrial and<br/>
                  <span className="text-gradient-orange">Machinary tools</span><br/>
                  <span className="text-gray-300 text-2xl sm:text-3xl font-light">Since 2017</span>
                </h1>
                
                <p className="text-navy-100 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
                  {settings?.company_description || 'Authorised dealer of premium industrial tools and machinery. Serving contractors, factories, and professionals across India with genuine products.'}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link to="/products" className="btn-primary text-base flex items-center gap-2 group shadow-lg shadow-accent/20 hover:shadow-accent/40">
                    Shop Catalog <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/categories" className="border border-white/20 text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-lg transition-all backdrop-blur-sm shadow-md">
                    Browse Categories
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Floating Industrial Visual collage */}
            <div className="lg:col-span-5 relative flex justify-center items-center h-[360px] sm:h-[400px]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full h-full relative"
              >
                {/* Main Glassmorphic Dashboard Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] bg-glass p-6 rounded-3xl shadow-2xl animate-float">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-accent font-bold uppercase tracking-widest bg-accent/25 border border-accent/30 px-2 py-0.5 rounded">PMTC Pro</span>
                    <Wrench className="text-accent animate-spin" size={16} style={{ animationDuration: '8s' }} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                        <Flame size={20} />
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">Industrial Catalog</p>
                        <p className="text-navy-200 text-[10px]">Active & Verified</p>
                      </div>
                    </div>
                    <div className="h-[1px] bg-white/10" />
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-white/5 border border-white/5 rounded-xl p-2">
                        <p className="text-white font-bold text-sm">100%</p>
                        <p className="text-navy-200 text-[8px] uppercase tracking-wide">Genuine</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl p-2">
                        <p className="text-white font-bold text-sm">GST</p>
                        <p className="text-navy-200 text-[8px] uppercase tracking-wide">Invoiced</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: Brand Spec */}
                <div className="absolute top-6 right-2 sm:right-6 w-[130px] sm:w-[160px] bg-glass-card p-3 sm:p-4 rounded-2xl shadow-xl animate-float-delayed flex items-center gap-2 sm:gap-3">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-white text-[10px] sm:text-[11px] font-bold">Bosch & Makita</p>
                    <p className="text-navy-200 text-[8px] sm:text-[9px]">Authorised Stock</p>
                  </div>
                </div>

                {/* Floating Card 3: Support */}
                <div className="absolute bottom-6 left-2 sm:left-6 w-[140px] sm:w-[180px] bg-glass-card p-3 sm:p-4 rounded-2xl shadow-xl animate-float flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent/25 flex items-center justify-center text-accent flex-shrink-0">
                    <CheckCircle size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-white text-[10px] sm:text-[11px] font-bold">Fast Support</p>
                    <p className="text-navy-200 text-[8px] sm:text-[9px]">Enquiries answered same-day</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Trust Strip (Enhanced grayscale logos) */}
      <section className="bg-white border-b border-gray-100 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">Authorised Brand Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {activeBrands.length > 0 ? (
              activeBrands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/products?brand=${brand.id}`}
                  className="group flex items-center justify-center bg-gray-50/60 hover:bg-white border border-gray-100 hover:border-accent/30 px-6 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="font-heading font-bold text-gray-400 group-hover:text-accent transition-colors duration-300 text-lg tracking-wide">
                    {brand.name}
                  </span>
                </Link>
              ))
            ) : (
              ['Bosch', 'Makita', 'Ingco', 'Dongcheng', 'Stanley', 'Total'].map((b) => (
                <div
                  key={b}
                  className="group flex items-center justify-center bg-gray-50/60 hover:bg-white border border-gray-100 hover:border-accent/30 px-6 py-4 rounded-2xl shadow-sm transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="font-heading font-bold text-gray-400 group-hover:text-accent transition-colors duration-300 text-lg tracking-wide">
                    {b}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Premium Features Counters Section */}
      <section className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {counters.map(({ value, label, desc, icon: Icon }) => (
              <div key={label} className="card p-6 bg-white flex flex-col justify-between items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 text-accent">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-3xl font-heading font-bold text-gray-900 mb-1">{value}</p>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned Product Categories Section */}
      {categories.length > 0 && (
        <section className="bg-white py-16 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Browse by Application</span>
                <h2 className="text-3xl font-heading font-bold text-gray-900 mt-2">Shop by Category</h2>
              </div>
              <Link to="/categories" className="text-accent hover:text-accent-dark font-medium text-sm flex items-center gap-1 mt-3 md:mt-0 hover:underline">
                View all categories <ArrowRight size={16}/>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {categories.slice(0, 6).map(cat => (
                <Link 
                  key={cat.id} 
                  to={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-gray-950 aspect-[4/3] flex items-end p-6 hover:shadow-xl transition-all duration-300"
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500"/>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-85 group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"/>
                  <div className="relative z-20 w-full flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-accent font-bold tracking-widest uppercase mb-1 block">Industrial</span>
                      <span className="text-white font-heading font-bold text-lg sm:text-xl block">{cat.name}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent hover:bg-accent-dark text-white flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Showcase Section */}
      <section className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Premium Selection</span>
              <h2 className="text-3xl font-heading font-bold text-gray-900 mt-2">Featured Products</h2>
            </div>
            <Link to="/products" className="text-accent hover:text-accent-dark font-medium text-sm flex items-center gap-1 hover:underline">
              View all products <ArrowRight size={16}/>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p}/>)}
            {featuredProducts.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-16">No featured products yet. Add some from the admin panel.</p>
            )}
          </div>
        </div>
      </section>

      {/* Industrial Showcase Section: Why PMTC? */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Visual Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 overflow-hidden shadow-2xl flex flex-col justify-between text-white">
                <div className="absolute inset-0 bg-blueprint opacity-10" />
                <div className="flex justify-between items-center relative z-10">
                  <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">Quality Certified</span>
                  <Shield size={24} className="text-accent animate-pulse" />
                </div>
                <div className="relative z-10 text-center my-auto space-y-2">
                  <p className="text-5xl font-heading font-extrabold text-accent">100%</p>
                  <p className="text-lg font-heading font-bold tracking-wide">Genuine Products</p>
                  <p className="text-xs text-navy-200">Every tool is sourced directly from certified authorized manufacturers</p>
                </div>
                <div className="relative z-10 text-[10px] text-navy-300 text-center uppercase tracking-widest">
                  PMTC Dealer Network
                </div>
              </div>
            </div>

            {/* Right Column: Why Choose Us list */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Industrial Partner</span>
              <h2 className="text-3xl font-heading font-bold text-gray-900 mt-2 mb-6">Why Professionals Trust PMTC</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: Shield, title: 'Genuine Brands Only', desc: 'Authorized suppliers for Bosch, Makita, and other industry leaders.' },
                  { icon: Award, title: 'Fair, GST-Compliant Pricing', desc: 'Transparent wholesale rates with clear business invoices.' },
                  { icon: Truck, title: 'Reliable Supply Chains', desc: 'Swift supply delivery covering Andhra Pradesh & Telangana regions.' },
                  { icon: HeadphonesIcon, title: 'Expert Domain Support', desc: 'Technical guidance to match the right machinery to your workshop.' }
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-gray-800 text-sm mb-1">{title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Slider Area */}
      <section className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Client Reviews</span>
          <h2 className="text-3xl font-heading font-bold text-gray-900 mt-2 mb-10">Feedback from Site Engineers</h2>
          
          <div className="relative min-h-[200px] bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-100 flex flex-col justify-between items-center text-center">
            
            <div className="flex gap-1 text-amber-400 mb-4 justify-center">
              {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} size={18} className="fill-amber-400" />
              ))}
            </div>
            
            <p className="text-gray-600 text-base md:text-lg italic leading-relaxed max-w-2xl mb-6">
              "{testimonials[activeTestimonial].text}"
            </p>
            
            <div>
              <p className="font-heading font-bold text-gray-800 text-sm">{testimonials[activeTestimonial].name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{testimonials[activeTestimonial].company}</p>
            </div>

            {/* Slider Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-16">
              <button onClick={prevTestimonial} className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-accent transition-colors" aria-label="Previous testimonial">
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-16">
              <button onClick={nextTestimonial} className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-accent transition-colors" aria-label="Next testimonial">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action (CTA) Redesign */}
      <section className="bg-primary relative overflow-hidden py-16 border-b border-primary-dark">
        <div className="absolute inset-0 bg-blueprint opacity-10" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">Need Industrial Tools For Your Next Project?</h2>
          <p className="text-navy-200 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Get custom wholesale quotes and confirm equipment availability within hours. We supply genuine, top-brand machinery matching your layout spec.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-primary text-sm px-8 py-3">
              Browse Machinery
            </Link>
            <Link to="/contact" className="border border-white/25 text-white hover:bg-white/5 font-semibold px-8 py-3 rounded-lg text-sm transition-all shadow-md">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
