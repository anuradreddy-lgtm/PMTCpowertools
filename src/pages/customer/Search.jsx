import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Products } from '../../lib/products'
import ProductCard from '../../components/shared/ProductCard'

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => Products.list({ search: q, is_active: true }),
    enabled: q.length > 0,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Search Results</h1>
        <p className="text-gray-500 text-sm mb-8">{q ? `Showing results for "${q}"` : 'Enter a search term'}</p>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="card aspect-square animate-pulse bg-gray-100"/>)}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(p=><ProductCard key={p.id} product={p}/>)}
            {q && products.length===0 && <p className="col-span-4 text-center text-gray-400 py-16">No products found for "{q}"</p>}
          </div>
        )}
      </div>
    </div>
  )
}
