import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  const isPositive = change >= 0

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-heading font-bold text-gray-900 mb-1">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-xs">
          {isPositive ? (
            <TrendingUp size={12} className="text-green-500" />
          ) : (
            <TrendingDown size={12} className="text-red-500" />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  )
}
