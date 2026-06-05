import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Search, Tags, Upload, X } from 'lucide-react'
import { Brands } from '../../lib/brands'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import toast from 'react-hot-toast'

const EMPTY = { name:'', slug:'', logo_url:'', description:'' }

const createSlug = name => name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export default function AdminBrands() {
  const qc = useQueryClient()
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [uploading, setUploading] = useState(false)

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: () => Brands.list(),
  })

  const filtered = brands.filter(brand => {
    const query = search.toLowerCase()
    return brand.name?.toLowerCase().includes(query) || brand.slug?.toLowerCase().includes(query)
  })

  const refreshBrands = () => {
    qc.invalidateQueries({ queryKey:['admin-brands'] })
    qc.invalidateQueries({ queryKey:['brands'] })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY)
  }

  const save = useMutation({
    mutationFn: data => {
      const payload = {
        name: data.name.trim(),
        slug: data.slug.trim() || createSlug(data.name),
        logo_url: data.logo_url,
        description: data.description,
      }
      return editing ? Brands.update(editing.id, payload) : Brands.create(payload)
    },
    onSuccess: () => {
      refreshBrands()
      closeModal()
      toast.success(editing ? 'Brand updated!' : 'Brand added!')
    },
    onError: error => toast.error(error.message),
  })

  const remove = useMutation({
    mutationFn: id => Brands.delete(id),
    onSuccess: () => {
      refreshBrands()
      toast.success('Deleted')
    },
    onError: error => {
      if (error.message?.includes('foreign key constraint') || error.message?.includes('violates foreign key')) {
        toast.error('Cannot delete this brand because it has associated products. Please delete or reassign the products first.')
      } else {
        toast.error(error.message || 'Failed to delete brand')
      }
    },
  })

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setShowModal(true)
  }

  const openEdit = brand => {
    setEditing(brand)
    setForm({
      name: brand.name || '',
      slug: brand.slug || '',
      logo_url: brand.logo_url || '',
      description: brand.description || '',
    })
    setShowModal(true)
  }

  const handleLogoSelect = async event => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const path = `brand-logos/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, file)

      if (error) throw error

      const { data: publicData, error: publicError } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      if (publicError) throw publicError
      setForm(current => ({ ...current, logo_url: publicData.publicUrl }))
    } catch (error) {
      toast.error(error.message || 'Logo upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar/>
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Brands</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} brands</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add Brand</button>
        </div>

        <div className="card p-4 mb-6 flex gap-3 items-center">
          <Search size={16} className="text-gray-400"/>
          <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search brands..." className="flex-1 text-sm border-0 outline-none bg-transparent"/>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Logo','Brand Name','Slug','Description','Actions'].map(heading=>(
                  <th key={heading} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{heading}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Loading...</td></tr>}
                {filtered.map(brand=>(
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      {brand.logo_url
                        ? <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 rounded-lg object-contain bg-gray-100 p-1"/>
                        : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><Tags size={18} className="text-gray-400"/></div>}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">{brand.name}</td>
                    <td className="px-5 py-4 text-gray-600">{brand.slug}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-md"><p className="line-clamp-2">{brand.description || '-'}</p></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={()=>openEdit(brand)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" aria-label={`Edit ${brand.name}`}><Edit2 size={15}/></button>
                        <button onClick={()=>{if(confirm('Delete?')) remove.mutate(brand.id)}} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" aria-label={`Delete ${brand.name}`}><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length===0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No brands found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={event=>event.target===event.currentTarget&&closeModal()}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" aria-labelledby="brand-modal-title">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 id="brand-modal-title" className="text-lg font-heading font-bold text-gray-900">{editing ? 'Edit Brand' : 'Add Brand'}</h2>
                <button onClick={closeModal} aria-label="Close dialog"><X size={20} className="text-gray-400"/></button>
              </div>
              <form onSubmit={event=>{event.preventDefault();save.mutate(form)}} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Brand Name *</label>
                  <input value={form.name} onChange={event=>setForm(current=>({...current,name:event.target.value}))} className="input-field" required placeholder="e.g. Bosch"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                  <input value={form.slug} onChange={event=>setForm(current=>({...current,slug:event.target.value}))} className="input-field" placeholder="auto-generated"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea value={form.description} onChange={event=>setForm(current=>({...current,description:event.target.value}))} className="input-field" rows={3} placeholder="Brief description"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Brand Logo</label>
                  <div className="space-y-3">
                    <label className="btn-outline inline-flex items-center gap-2 px-4 py-2 cursor-pointer text-sm">
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect}/>
                      <Upload size={15}/> Upload logo
                    </label>
                    {uploading && <p className="text-sm text-gray-500">Uploading logo...</p>}
                    {form.logo_url && (
                      <div className="relative w-28 overflow-hidden rounded-lg border border-gray-200">
                        <img src={form.logo_url} alt="Brand logo preview" className="w-28 h-28 object-contain bg-gray-50 p-2"/>
                        <button type="button" onClick={()=>setForm(current=>({...current,logo_url:''}))} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-red-500 hover:bg-white" aria-label="Remove logo"><X size={14}/></button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="btn-outline px-5 py-2 text-sm">Cancel</button>
                  <button type="submit" disabled={save.isPending || uploading} className="btn-primary px-5 py-2 text-sm">
                    {save.isPending ? 'Saving...' : 'Save Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
