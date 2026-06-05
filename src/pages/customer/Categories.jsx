import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Categories as CategoriesAPI } from '../../lib/categories'

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoriesAPI.list(),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-8">All Categories</h1>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="card aspect-video animate-pulse bg-gray-100"/>)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(cat=>(
              <Link key={cat.id} to={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-card bg-primary aspect-video flex items-end p-6 hover:shadow-hover transition-shadow">
                {cat.image_url && <img src={cat.image_url} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"/>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                <div className="relative">
                  <p className="text-white font-heading font-bold text-xl">{cat.name}</p>
                  {cat.description && <p className="text-white/70 text-sm mt-1">{cat.description}</p>}
                </div>
              </Link>
            ))}
            {categories.length===0 && <p className="col-span-3 text-center text-gray-400 py-16">No categories yet. Add from admin panel.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
