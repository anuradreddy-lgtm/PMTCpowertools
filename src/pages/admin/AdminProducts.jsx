import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Search, Package, X } from 'lucide-react'
import { Products } from '../../lib/products'
import { Categories } from '../../lib/categories'
import { Brands } from '../../lib/brands'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import toast from 'react-hot-toast'

const EMPTY = { name:'', slug:'', description:'', stock:'', sku:'', category_id:'', brand_id:'', images:'', image_urls: [], is_active:true, is_featured:false }

export default function AdminProducts() {
  const qc = useQueryClient()
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [uploading, setUploading]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => Products.list(),
  })

  const { data: categories = [] } = useQuery({ queryKey:['categories'], queryFn:()=>Categories.list() })
  const { data: brands = [] }     = useQuery({ queryKey:['brands'],     queryFn:()=>Brands.list() })

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  const save = useMutation({
    mutationFn: async (data) => {
      const image_urls = data.image_urls?.length
        ? data.image_urls
        : typeof data.images === 'string'
          ? data.images.split(',').map(s=>s.trim()).filter(Boolean)
          : data.images

      const payload = {
        ...data,
        stock: parseInt(data.stock),
        image_urls,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''),
      }
      if (editing) return Products.update(editing.id, payload)
      return Products.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-products'])
      setShowModal(false); setEditing(null); setForm(EMPTY)
      toast.success(editing ? 'Product updated!' : 'Product added!')
    },
    onError: e => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: id => Products.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); toast.success('Deleted') },
  })

  const openEdit = p => {
    setEditing(p)
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      stock: p.stock ?? '',
      sku: p.sku || '',
      category_id: p.category_id || '',
      brand_id: p.brand_id || '',
      images: Array.isArray(p.images) ? p.images.join(', ') : p.images || '',
      image_urls: p.image_urls ?? p.images ?? [],
      is_active: p.is_active ?? true,
      is_featured: p.is_featured ?? false,
    })
    setShowModal(true)
  }

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }

  const handleImageSelect = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setUploading(true)
    const urls = form.image_urls ? [...form.image_urls] : []

    try {
      for (const file of files) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        const path = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(path, file)

        if (error) throw error

        const { data: publicData, error: publicError } = await supabase.storage
          .from('product-images')
          .getPublicUrl(data.path)

        if (publicError) throw publicError
        urls.push(publicData.publicUrl)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
      }

      setForm(f => ({ ...f, image_urls: urls }))
    } catch (error) {
      toast.error(error.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url) => {
    setForm(f => ({
      ...f,
      image_urls: (f.image_urls || []).filter(i => i !== url),
    }))
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar/>
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} products</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add Product</button>
        </div>

        <div className="card p-4 mb-6 flex gap-3 items-center">
          <Search size={16} className="text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" className="flex-1 text-sm border-0 outline-none bg-transparent"/>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Product','Brand','Category','Stock','Status','Actions'].map(h=>(
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Loading…</td></tr>}
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-contain bg-gray-100 p-1"/>
                          : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Package size={16} className="text-gray-400"/></div>}
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{p.brand_name || '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{p.category_name || '—'}</td>
                    
                    <td className="px-5 py-4">
                      <span className={p.stock>10?'badge-success':p.stock>0?'badge-warning':'badge-danger'}>
                        {p.stock>0?`${p.stock} units`:'Out of stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={p.is_active?'badge-success':'badge-danger'}>{p.is_active?'Active':'Hidden'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={()=>openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={15}/></button>
                        <button onClick={()=>{if(confirm('Delete?'))remove.mutate(p.id)}} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length===0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No products found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 id="product-modal-title" className="text-lg font-heading font-bold text-gray-900">{editing?'Edit Product':'Add Product'}</h2>
                <button onClick={()=>setShowModal(false)} aria-label="Close dialog"><X size={20} className="text-gray-400"/></button>
              </div>
              <form onSubmit={e=>{e.preventDefault();save.mutate(form)}} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                    <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input-field" required placeholder="e.g. Bosch GBM 350 Drill"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                    <input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} className="input-field" required min="0"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))} className="input-field">
                      <option value="">— Select —</option>
                      {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                    <select value={form.brand_id} onChange={e=>setForm(f=>({...f,brand_id:e.target.value}))} className="input-field">
                      <option value="">— Select —</option>
                      {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input-field" rows={3}/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Product Images</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="btn-outline px-4 py-2 cursor-pointer text-sm">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                          />
                          Upload images
                        </label>
                        {uploading && <span className="text-sm text-gray-500">Uploading images…</span>}
                      </div>

                      {Array.isArray(form.image_urls) && form.image_urls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {form.image_urls.map(url => (
                            <div key={url} className="relative overflow-hidden rounded-lg border border-gray-200">
                              <img src={url} alt="Product" className="w-full h-24 object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(url)}
                                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-red-500 hover:bg-white"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {Object.entries(uploadProgress).length > 0 && (
                        <div className="space-y-2">
                          {Object.entries(uploadProgress).map(([name, progress]) => (
                            <div key={name} className="text-xs text-gray-500">
                              {name}: {progress}%
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Or paste image URLs manually</label>
                        <input value={form.images} onChange={e=>setForm(f=>({...f,images:e.target.value}))} className="input-field" placeholder="https://…img1.jpg, https://…img2.jpg"/>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} className="rounded"/>
                    Active (visible on site)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))} className="rounded"/>
                    Featured on homepage
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={()=>setShowModal(false)} className="btn-outline px-5 py-2 text-sm">Cancel</button>
                  <button type="submit" disabled={save.isPending} className="btn-primary px-5 py-2 text-sm">
                    {save.isPending?'Saving…':editing?'Update':'Add Product'}
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
