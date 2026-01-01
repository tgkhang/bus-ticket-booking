import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Percent, Users, BarChart3, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react'

type IconKey = 'bookings' | 'conversion' | 'occupancy' | 'routes' | 'revenue' | 'avg' | 'orders' | 'customers'

interface MetricCardProps {
  title: string
  value: string | number
  icon: IconKey
  className?: string
  onClick?: () => void
}

const icons = {
  bookings: Calendar,
  conversion: Percent,
  occupancy: BarChart3,
  routes: Users,
  revenue: DollarSign,
  avg: TrendingUp,
  orders: ShoppingCart,
  customers: Users,
}

const colors = {
  bookings: 'blue',
  conversion: 'green',
  occupancy: 'purple',
  routes: 'yellow',
  revenue: 'blue',
  avg: 'green',
  orders: 'purple',
  customers: 'yellow',
}

export default function MetricCard({
  title,
  value,
  icon,
  className,
  onClick,
}: MetricCardProps) {
  const Icon = icons[icon]
  const color = colors[icon]

  // Formatting logic
  const formatValue = () => {
    const formattedValue = typeof value === 'number' ? value.toLocaleString('vi-VN') : value

    if (title.includes('Rate') || title.includes('Occupancy')) {
      return `${formattedValue}%`
    }
    if (title.includes('Revenue') || title.includes('Transaction')) {
      return `${formattedValue} VND`
    }
    return formattedValue
  }

  return (
    <Card
      className={`${className || ''} hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue()}
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}