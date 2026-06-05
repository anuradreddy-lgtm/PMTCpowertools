import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pmtc_cart') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('pmtc_cart', JSON.stringify(items))
    } catch (e) {
      console.error('Failed to write cart to localStorage', e)
    }
    // Debug: log cart length on updates to help trace clear behavior
    try {
      if (import.meta.env && import.meta.env.DEV) console.debug('[useCart] items updated:', items.length)
    } catch (e) {
      // ignore in non-compatible environments
    }
  }, [items])

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) =>
    setItems(prev => prev.filter(i => i.id !== productId))

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId)
    setItems(prev =>
      prev.map(i => i.id === productId ? { ...i, quantity } : i)
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
