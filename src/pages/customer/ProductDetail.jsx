import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, ArrowLeft, Package, CheckCircle } from 'lucide-react'
import { Products } from '../../lib/products'
import { useCart } from '../../hooks/useCart'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [qty, setQty]       = useState(1)
  const [imgIdx, setImgIdx] = useState(0)

  console.log('URL slug:', slug)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => Products.list({ slug, is_active: true }),
  })

  const product = products.find((p) => p.slug === slug)

  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"/></div>
  if (!product)  return <div className="flex flex-col items-center justify-center h-screen gap-4"><p className="text-gray-500">Product not found</p><Link to="/products" className="btn-primary">Back to Products</Link></div>


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6"><ArrowLeft size={16}/> Back to Products</Link>
        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="card aspect-square flex items-center justify-center p-8 mb-3">
              {product.images?.[imgIdx]
                ? <img src={product.images[imgIdx]} alt={product.name} className="max-h-80 object-contain"/>
                : <Package size={80} className="text-gray-200"/>}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img,i)=>(
                  <button key={i} onClick={()=>setImgIdx(i)} className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${i===imgIdx?'border-accent':'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-1"/>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Info */}
          <div>
            <p className="text-accent text-sm font-medium mb-2">{product.brand_name}</p>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="mb-6">
              <p className="text-sm text-gray-500">{product.category_name || product.sku || 'Product details'}</p>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0
                ? <><CheckCircle size={16} className="text-green-500"/> <span className="text-green-700 text-sm font-medium">In Stock ({product.stock} units)</span></>
                : <span className="text-red-500 text-sm font-medium">Out of Stock</span>}
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">−</button>
                <span className="px-4 py-2 text-sm font-medium">{qty}</span>
                <button onClick={()=>setQty(q=>Math.min(product.stock,q+1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">+</button>
              </div>
              <button onClick={()=>{addToCart(product,qty);toast.success('Added to cart!')}}
                disabled={product.stock<1}
                className="btn-primary flex items-center gap-2 flex-1 justify-center">
                <ShoppingCart size={18}/> Add to Cart
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.sku && <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 text-xs">SKU</p><p className="font-medium">{product.sku}</p></div>}
              {product.category_name && <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 text-xs">Category</p><p className="font-medium">{product.category_name}</p></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
