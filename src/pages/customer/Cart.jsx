import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { supabase } from '../../lib/supabase'
import { generateOrderNumber } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart()
  const [customer, setCustomer] = useState({ name:'', phone:'', email:'' })

  const handleCheckout = async () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim()) {
      toast.error('Please enter your name, phone number, and email.')
      return
    }

    const itemLines = items.map(item => 
      `• ${item.quantity}x ${item.name ?? item.title ?? 'Product'}`
    ).join('\n')
    const productSummary = items.map(item => `${item.quantity}x ${item.name ?? item.title ?? 'Product'}`).join('; ')
    const productIds = items.map(item => item.id).join('; ')
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const orderPayload = {
      order_number: generateOrderNumber(),
      customer_name: customer.name.trim(),
      email: customer.email.trim(),
      customer_phone: customer.phone.trim(),
      product_name: productSummary,
      product_id: productIds,
      quantity: totalQuantity,
      status: 'new',
      created_at: new Date().toISOString(),
    }

    const message = `Hi PMTC, I'd like to enquire about the following items:\n\n${itemLines}\n\nName: ${customer.name.trim()}\nPhone: ${customer.phone.trim()}\nEmail: ${customer.email.trim()}\n\nPlease confirm availability and pricing.`

    window.open(`https://wa.me/919397914866?text=${encodeURIComponent(message)}`, '_blank')

    const { error } = await supabase.from('orders').insert([orderPayload])
    if (error) {
      console.error('Supabase order save failed:', JSON.stringify(error, null, 2), orderPayload)
      toast.error('Could not save the enquiry order. Please try again.')
      return
    }

    // Ensure cart state and storage are cleared after successful insert
    try {
      console.debug('Supabase insert success')
      clearCart()
      // remove localStorage entry explicitly to ensure no stale data
      try { localStorage.removeItem('pmtc_cart') } catch (e) { console.warn('Failed to remove pmtc_cart from localStorage', e) }
      console.debug('Cart cleared after successful enquiry')
    } catch (e) {
      console.error('Error during cart clear:', e)
    }

    toast.success("Enquiry sent and saved! We'll confirm your order shortly.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6"><ArrowLeft size={16}/> Continue Shopping</Link>
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-8">Your Cart ({items.length} items)</h1>

        {items.length === 0 ? (
          <div className="card p-16 text-center">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500 mb-6">Your cart is empty</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1 flex-shrink-0"/>
                      : <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 font-semibold text-xs">No Image</div>}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm line-clamp-2 leading-snug">{item.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t border-gray-50 sm:border-t-0">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button onClick={()=>updateQuantity(item.id, item.quantity-1)} className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm font-semibold">−</button>
                      <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                      <button onClick={()=>updateQuantity(item.id, item.quantity+1)} className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm font-semibold">+</button>
                    </div>
                    <p className="font-bold text-primary text-sm min-w-[64px] text-right">{item.quantity} pcs</p>
                    <button onClick={()=>removeFromCart(item.id)} className="text-red-400 hover:text-red-650 p-1.5 hover:bg-red-50 rounded-lg transition-colors" aria-label="Remove item"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-6 h-fit sticky top-24">
              <h2 className="font-heading font-semibold text-gray-800 mb-4">Your Contact Details</h2>
              <div className="space-y-3 mb-4">
                {[['Name','name','text'],['Phone Number','phone','tel'],['Email','email','email']].map(([label,name,type])=>(
                  <div key={name}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type={type}
                      value={customer[name]}
                      onChange={e=>setCustomer(current=>({...current,[name]:e.target.value}))}
                      className="input-field"
                      placeholder={name === 'name' ? 'Your name' : name === 'phone' ? 'Your phone number' : 'Your email address'}
                      required
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full mb-3">Send Enquiry via WhatsApp</button>
              <p className="text-xs text-gray-400 text-center">We'll confirm stock and pricing within a few hours.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
