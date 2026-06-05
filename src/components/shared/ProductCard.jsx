import { Link } from 'react-router-dom'
import { ShoppingCart, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../../hooks/useCart'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock < 1) return toast.error('Out of stock')
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link 
        to={`/products/${product.slug}`} 
        className="card h-full flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:border-gray-200/80 transition-all duration-300 bg-white rounded-2xl border border-gray-100"
      >
        <div>
          {/* Image aspect-square container */}
          <div className="relative aspect-square bg-gray-50/70 overflow-hidden flex items-center justify-center border-b border-gray-50">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={40} />
              </div>
            )}
            {product.stock < 1 && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-white/95 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-4 pb-2">
            <span className="text-[10px] text-accent font-bold tracking-wider uppercase bg-accent/10 px-2 py-0.5 rounded">
              {product.brand_name || product.brands?.name || 'PMTC'}
            </span>
            <h3 className="text-xs sm:text-sm font-heading font-semibold text-gray-800 line-clamp-2 mt-2 leading-snug min-h-[38px] group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Footer actions of card */}
        <div className="p-4 pt-0">
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 truncate">{product.category_name || product.sku || 'Industrial Grade'}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              className="bg-accent hover:bg-accent/90 disabled:bg-gray-150 disabled:text-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-accent/20 flex-shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
