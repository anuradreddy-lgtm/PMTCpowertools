import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Phone, Mail, MapPin } from 'lucide-react'
import CompanyLogo from './CompanyLogo'
import { getSiteSettings } from '../../lib/siteSettings'

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    retry: 1,
    staleTime: 60_000,
  })

  return (
    <footer className="bg-primary/95 text-navy-200 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent-light to-primary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Column 1: Brand details */}
          <div className="md:col-span-5 space-y-4">
            <CompanyLogo className="h-16 w-auto rounded bg-white/95 p-1.5 border border-white/20 shadow-md" />
            <p className="text-sm leading-relaxed max-w-sm">
              {settings?.company_description || 'Authorised dealer of premium industrial tools and machinery. Serving contractors, factories, and professionals across India since 2017.'}
            </p>
            <div className="flex gap-3 pt-2">
              {['Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((social) => (
                <span 
                  key={social} 
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-accent hover:text-white border border-white/10 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-200"
                  title={social}
                >
                  {social.charAt(0)}
                </span>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3">
            <p className="text-white font-heading font-bold text-sm mb-5 uppercase tracking-wider">Quick Links</p>
            <ul className="space-y-3 text-sm">
              {[
                ['/', 'Home'],
                ['/products', 'Products Catalog'],
                ['/categories', 'Browse Categories'],
                ['/contact', 'Contact Sales']
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-white font-heading font-bold text-sm uppercase tracking-wider">Contact Info</p>
            <div className="space-y-3 text-sm">
              <a href={`tel:${settings?.phone_number || '6281778963'}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all"><Phone size={14} /></div>
                <span>{settings?.phone_number || '6281778963'}</span>
              </a>
              <a href={`mailto:${settings?.email_address || 'pmtcpowertools@gmail.com'}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all"><Mail size={14} /></div>
                <span>{settings?.email_address || 'pmtcpowertools@gmail.com'}</span>
              </a>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent flex-shrink-0 mt-0.5"><MapPin size={14} /></div>
                <div className="text-xs leading-relaxed">
                  {settings?.company_address?.split(',').map((line) => (
                    <p key={line}>{line.trim()}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator and GST Info */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-200">
          <p>© {new Date().getFullYear()} {settings?.company_name || 'Padma Mitra Trading Company'}. All rights reserved.</p>
          <div className="flex gap-6">
            <p>GSTIN: <span className="text-white font-mono">{settings?.gst_number || '36AABCP1234M1Z5'}</span></p>
            <p>Hours: <span className="text-white">{settings?.business_hours || 'Mon–Sat, 9AM–6PM'}</span></p>
          </div>
        </div>
      </div>
    </footer>
  )
}
