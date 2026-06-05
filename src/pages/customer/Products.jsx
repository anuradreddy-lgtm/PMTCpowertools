import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { Products as ProductsAPI } from '../../lib/products'
import { Categories } from '../../lib/categories'
import { Brands } from '../../lib/brands'
import ProductCard from '../../components/shared/ProductCard'

export default function Products() {
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get('category') || ''
  const brandId = searchParams.get('brand') || ''
  const searchQ = searchParams.get('q') || ''
  const [category, setCategory] = useState(categorySlug)
  const [brand, setBrand]       = useState(brandId)
  const [sort, setSort]         = useState('newest')

  const { data: categories = [] } = useQuery({ queryKey:['categories'], queryFn:()=>Categories.list() })
  const { data: brands = [] }     = useQuery({ queryKey:['brands'],     queryFn:()=>Brands.list() })

  const categoryId = categories.find((c) => c.slug === category)?.id || ''
  const selectedBrandId = brand

  useEffect(() => {
    setCategory(categorySlug)
    setBrand(brandId)
  }, [categorySlug, brandId])

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', categoryId, selectedBrandId],
    queryFn: () => ProductsAPI.list({
      is_active: true,
      ...(categoryId && { category_id: categoryId }),
      ...(selectedBrandId && { brand_id: selectedBrandId }),
    }),
  })

  const sorted = [...products].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))

  const filtered = searchQ
    ? sorted.filter(p =>
        p.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQ.toLowerCase())
      )
    : sorted

  const noProductsMessage = category || brand || searchQ
    ? 'No products found for the selected filters.'
    : 'No products found'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">All Products</h1>
        
        {/* Mobile Quick Filters (Horizontal scroll, visible only on mobile/tablets) */}
        <div className="md:hidden space-y-4 mb-6">
          {/* Categories */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              <button
                onClick={() => setCategory('')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 snap-start ${
                  !category ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 snap-start ${
                    category === c.slug ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Brands</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              <button
                onClick={() => setBrand('')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 snap-start ${
                  !brand ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBrand(b.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 snap-start ${
                    String(brand) === String(b.id) ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="card p-5 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="cat" value="" checked={!category} onChange={()=>setCategory('')}/> All
                  </label>
                  {categories.map(c=>(
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="cat" value={c.slug} checked={category===c.slug} onChange={()=>setCategory(c.slug)}/> {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Brand</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="brand" value="" checked={!brand} onChange={()=>setBrand('')}/> All
                  </label>
                  {brands.map((b) => (
                    <label
                      key={b.id}
                      className={`flex items-center gap-2 text-sm cursor-pointer ${String(brand) === String(b.id) ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}
                    >
                      <input
                        type="radio"
                        name="brand"
                        value={b.id}
                        checked={String(brand) === String(b.id)}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          {/* Products grid */}
          <div className="flex-1">
            {searchQ && (
              <div className="flex items-center mb-4">
                <p className="text-gray-500 text-sm">
                  Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="font-medium text-gray-800">{searchQ}</span>"
                </p>
                <Link to="/products" className="text-accent text-sm ml-2 hover:underline">Clear</Link>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{filtered.length} products</p>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="input-field w-44 text-sm">
                <option value="newest">Newest first</option>
              </select>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="card aspect-square animate-pulse bg-gray-100"/>)}</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map((p) => <ProductCard key={p.id} product={p}/>)}
                {filtered.length === 0 && (
                  <p className="col-span-3 text-center text-gray-400 py-16">
                    {noProductsMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
