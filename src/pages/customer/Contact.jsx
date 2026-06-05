import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, Mail, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSiteSettings } from '../../lib/siteSettings'
import { supabase } from '../../lib/supabase'

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' })
  const [isLoading, setIsLoading] = useState(false)
  const { data: settings } = useQuery({ queryKey:['site-settings'], queryFn:getSiteSettings, retry:1, staleTime:60_000 })
  
  const handle = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      let success = false
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        
        if (response.ok) {
          success = true
        } else {
          console.warn('[Contact] Fetch to /api/contact failed, attempting database fallback...')
        }
      } catch (fetchErr) {
        console.warn('[Contact] Network error to /api/contact, attempting database fallback:', fetchErr)
      }

      if (!success) {
        // Fallback: Save enquiry directly to the orders table in Supabase
        const payload = {
          order_number: `ENQ-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`,
          customer_name: form.name.trim(),
          email: form.email.trim(),
          customer_phone: form.phone.trim(),
          product_name: `Contact Message: ${form.message.trim().slice(0, 100)}${form.message.length > 100 ? '...' : ''}`,
          product_id: 'contact_form',
          quantity: 1,
          status: 'new',
          created_at: new Date().toISOString(),
        }

        const { error: dbError } = await supabase.from('orders').insert([payload])
        if (dbError) {
          throw new Error(dbError.message || 'Unable to save message. Please try again.')
        }
      }
      
      toast.success("Message sent! We'll reply within 24 hours.")
      setForm({ name:'', email:'', phone:'', message:'' })
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-10">We're here to help. Reach out and we'll respond within 24 hours.</p>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="card p-8">
              <form onSubmit={handle} className="space-y-4">
                {[['Name','name','text','Your name'],['Email','email','email', settings?.email_address || 'pmtcpowertools@gmail.com'],['Phone','phone','tel', settings?.phone_number || '6281778963']].map(([label,name,type,placeholder])=>(
                  <div key={name}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input type={type} value={form[name]} onChange={e=>setForm(f=>({...f,[name]:e.target.value}))} className="input-field" placeholder={placeholder} required/>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                  <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} className="input-field" rows={4} placeholder="How can we help you?" required/>
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">{isLoading ? 'Sending...' : 'Send Message'}</button>
              </form>
            </div>
          </div>
          <div className="space-y-6">
            <div className="group flex items-start gap-4 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0"><Phone size={20} className="text-accent"/></div>
              <div><a href={`tel:${settings?.phone_number || '6281778963'}`} className="font-medium text-gray-800 group-hover:text-accent transition-colors">{settings?.phone_number || '6281778963'}</a><p className="text-gray-500 text-sm">{settings?.business_hours || 'Mon–Sat, 9AM–6PM'}</p></div>
            </div>
            <div className="group flex items-start gap-4 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0"><Mail size={20} className="text-accent"/></div>
              <div><a href={`mailto:${settings?.email_address || 'pmtcpowertools@gmail.com'}`} className="font-medium text-gray-800 group-hover:text-accent transition-colors">{settings?.email_address || 'pmtcpowertools@gmail.com'}</a><p className="text-gray-500 text-sm">We reply within 24 hours</p></div>
            </div>
            <div className="group flex items-start gap-4 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin size={20} className="text-accent"/></div>
              <div><a href={settings?.google_maps_link || 'https://www.google.com/maps/search/D.+No+8-24-19%2F1,+Miriyala+Vaari+Street,+Near+Ratna+Palace,+Main+Road,+Rajamahendravaram+-+533101'} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-800 group-hover:text-accent transition-colors">{settings?.company_address || 'D. No 8-24-19/1, Miriyala Vaari Street, Near Ratna Palace, Main Road, Rajamahendravaram - 533101'}</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
