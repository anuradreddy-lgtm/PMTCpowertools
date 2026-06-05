import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react'
import { Categories } from '../../lib/categories'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY = { name:'', slug:'', description:'', image_url:'' }

export default function AdminCategories() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [uploading, setUploading] = useState(false)

  const handleImageSelect = async event => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const path = `category-images/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, file)

      if (error) throw error

      const { data: publicData, error: publicError } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      if (publicError) throw publicError
      setForm(current => ({ ...current, image_url: publicData.publicUrl }))
      toast.success('Image uploaded!')
    } catch (error) {
      toast.error(error.message || 'Image upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const { data: categories = [] } = useQuery({ queryKey:['admin-categories'], queryFn:()=>Categories.list() })

  const save = useMutation({
    mutationFn: d => editing ? Categories.update(editing.id, d) : Categories.create({...d, slug: d.slug || d.name.toLowerCase().replace(/\s+/g,'-')}),
    onSuccess: () => { qc.invalidateQueries(['admin-categories']); setShowModal(false); setEditing(null); setForm(EMPTY); toast.success(editing?'Updated!':'Added!') },
    onError: e => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: id => Categories.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-categories']); toast.success('Deleted') },
    onError: error => {
      if (error.message?.includes('foreign key constraint') || error.message?.includes('violates foreign key')) {
        toast.error('Cannot delete this category because it has associated products. Please delete or reassign the products first.')
      } else {
        toast.error(error.message || 'Failed to delete category')
      }
    },
  })

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar/>
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Categories</h1>
          <button onClick={()=>{setEditing(null);setForm(EMPTY);setShowModal(true)}} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add Category</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c=>(
            <div key={c.id} className="card p-5 flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{
                  setEditing(c);
                  setForm({
                    name: c.name || '',
                    slug: c.slug || '',
                    description: c.description || '',
                    image_url: c.image_url || '',
                  });
                  setShowModal(true);
                }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={15}/></button>
                <button onClick={()=>{if(confirm('Delete?'))remove.mutate(c.id)}} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 id="category-modal-title" className="font-heading font-bold text-gray-900">{editing?'Edit':'Add'} Category</h2>
                <button onClick={()=>setShowModal(false)} aria-label="Close dialog"><X size={20} className="text-gray-400"/></button>
              </div>
              <form onSubmit={e=>{e.preventDefault();save.mutate(form)}} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input-field" placeholder="Category name" required/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                  <input value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} className="input-field" placeholder="auto-generated"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input-field" rows={3} placeholder="Brief description"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category Image</label>
                  <div className="space-y-3">
                    <label className="btn-outline inline-flex items-center gap-2 px-4 py-2 cursor-pointer text-sm">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect}/>
                      <Upload size={15}/> Upload image
                    </label>
                    {uploading && <p className="text-sm text-gray-500">Uploading image...</p>}
                    {form.image_url && (
                      <div className="relative w-28 overflow-hidden rounded-lg border border-gray-200">
                        <img src={form.image_url} alt="Category preview" className="w-28 h-28 object-contain bg-gray-50 p-2"/>
                        <button type="button" onClick={()=>setForm(f=>({...f,image_url:''}))} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-red-500 hover:bg-white" aria-label="Remove image"><X size={14}/></button>
                      </div>
                    )}
                    <input value={form.image_url ?? ''} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} className="input-field text-xs text-gray-500" placeholder="Or enter image URL manually"/>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setShowModal(false)} className="btn-outline px-4 py-2 text-sm">Cancel</button>
                  <button type="submit" disabled={save.isPending || uploading} className="btn-primary px-4 py-2 text-sm">
                    {save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}
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
