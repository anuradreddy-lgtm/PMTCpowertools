import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Eye, X, CheckCheck, Trash2 } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const STATUS = ['new','read','pending','confirmed','shipped','delivered','cancelled']
const badge  = { new:'badge-warning', read:'badge-success', pending:'badge-warning', confirmed:'badge-info', shipped:'badge-info', delivered:'badge-success', cancelled:'badge-danger' }

export default function AdminOrders() {
  const qc = useQueryClient()
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [viewOrder, setViewOrder] = useState(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const filtered = orders.filter(o => {
    const term = search.toLowerCase()
    const matchSearch = !search || [
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.email,
      o.product_name,
    ].some(value => value?.toLowerCase().includes(term))
    const matchStatus = !filter || o.status === filter
    return matchSearch && matchStatus
  })

  const updateStatus = useMutation({
    mutationFn: async ({id, status}) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries(['admin-orders']); toast.success('Status updated') },
  })

  const deleteOrder = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-orders'])
      toast.success('Deleted')
    },
    onError: error => toast.error(error.message),
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar/>
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Customer Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} enquiries</p>
        </div>

        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search size={16} className="text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search enquiries…" className="text-sm border-0 outline-none bg-transparent flex-1"/>
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="input-field w-44 text-sm">
            <option value="">All statuses</option>
            {STATUS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Customer Name','Phone Number','Email','Product Name','Quantity','Status','Date','Actions'].map(h=>(
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">Loading…</td></tr>}
                {filtered.map(o=>(
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">{o.customer_name||'Guest'}</td>
                    <td className="px-5 py-4 text-gray-600">{o.customer_phone || '-'}</td>
                    <td className="px-5 py-4 text-gray-600">{o.email || '-'}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 break-words max-w-xl">{o.product_name}</td>
                    <td className="px-5 py-4 font-semibold text-primary">{o.quantity ?? '-'}</td>
                    <td className="px-5 py-4">
                      <select value={o.status} onChange={e=>updateStatus.mutate({id:o.id,status:e.target.value})}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${badge[o.status]}`}>
                        {STATUS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={()=>setViewOrder(o)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="View Details"><Eye size={15}/></button>
                        {o.status === 'new' && (
                          <button onClick={()=>updateStatus.mutate({id:o.id,status:'read'})} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Mark as Read"><CheckCheck size={16}/></button>
                        )}
                        <button onClick={()=>{if(confirm('Delete?')) deleteOrder.mutate(o.id)}} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Enquiry"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading&&filtered.length===0&&<tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No enquiries found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {viewOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setViewOrder(null)}>
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-auto">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-heading font-bold text-gray-900">Enquiry {viewOrder.order_number}</h2>
                <button onClick={()=>setViewOrder(null)}><X size={20} className="text-gray-400"/></button>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-gray-400 text-xs mb-1">Customer Name</p><p className="font-medium">{viewOrder.customer_name}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Phone Number</p><p className="font-medium">{viewOrder.customer_phone || 'N/A'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Email</p><p className="font-medium">{viewOrder.email || 'N/A'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Status</p><span className={badge[viewOrder.status]}>{viewOrder.status}</span></div>
                  <div><p className="text-gray-400 text-xs mb-1">Qty</p><p className="font-medium">{viewOrder.quantity ?? 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-xs mb-1">Products</p><p className="font-medium whitespace-pre-wrap">{viewOrder.product_name}</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
