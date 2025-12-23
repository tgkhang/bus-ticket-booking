// components/MetricCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: 'revenue' | 'avg' | 'orders' | 'customers'
}

const icons = {
  revenue: DollarSign,
  avg: TrendingUp,
  orders: ShoppingCart,
  customers: Users,
}

const colors = {
  revenue: 'blue',
  avg: 'green',
  orders: 'purple',
  customers: 'yellow',
}

export default function MetricCard({ title, value, icon = 'revenue' }: MetricCardProps) {
  const Icon = icons[icon]
  const color = colors[icon]

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString('vi-VN') : value} {title.includes('Revenue') || title.includes('Transaction') ? 'VND' : ''}
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