import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Percent, Users, BarChart3 } from 'lucide-react'

interface BookingMetricCardProps {
  title: string
  value: string | number
  icon?: 'bookings' | 'conversion' | 'occupancy' | 'routes'
}

const icons = {
  bookings: Calendar,
  conversion: Percent,
  occupancy: BarChart3,
  routes: Users,
}

const colors = {
  bookings: 'blue',
  conversion: 'green',
  occupancy: 'purple',
  routes: 'yellow',
}

export default function BookingMetricCard({ title, value, icon = 'bookings' }: BookingMetricCardProps) {
  const Icon = icons[icon]
  const color = colors[icon]

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString('vi-VN') : value} {title.includes('Rate') || title.includes('Occupancy') ? '%' : ''}
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