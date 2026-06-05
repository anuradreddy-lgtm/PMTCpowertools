// Format currency in Indian Rupees
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

// Format date
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

// Discount %
export const discountPercent = (price, mrp) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0

// Generate order number
export const generateOrderNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `PMTC-${year}-${random}`
}

// Truncate text
export const truncate = (text, length = 80) =>
  text?.length > length ? text.slice(0, length) + '...' : text

// Order status color
export const statusColor = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger',
  }
  return map[status] || 'info'
}
