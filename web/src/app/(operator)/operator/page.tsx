'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Bus, Calendar, Users, TrendingUp, TrendingDown } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Total Bookings',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'Active Trips',
      value: '48',
      change: '+5.2%',
      trend: 'up',
      icon: Bus,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'Revenue',
      value: '₫24.5M',
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Total Users',
      value: '892',
      change: '-2.1%',
      trend: 'down',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]

  const recentBookings = [
    {
      id: 'BUS-2024-123456',
      customer: 'John Doe',
      route: 'HCMC → Da Lat',
      status: 'confirmed',
      amount: 700000,
      date: '2024-12-15',
    },
    {
      id: 'BUS-2024-123455',
      customer: 'Jane Smith',
      route: 'Hanoi → Ha Long',
      status: 'pending',
      amount: 180000,
      date: '2024-12-14',
    },
    {
      id: 'BUS-2024-123454',
      customer: 'Mike Johnson',
      route: 'Da Nang → Hue',
      status: 'confirmed',
      amount: 360000,
      date: '2024-12-13',
    },
    {
      id: 'BUS-2024-123453',
      customer: 'Sarah Wilson',
      route: 'HCMC → Nha Trang',
      status: 'completed',
      amount: 640000,
      date: '2024-12-12',
    },
    {
      id: 'BUS-2024-123452',
      customer: 'Tom Brown',
      route: 'Hanoi → Sapa',
      status: 'confirmed',
      amount: 560000,
      date: '2024-12-11',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'cancelled':
        return 'bg-red-500 text-white'
      case 'completed':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {booking.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {booking.route}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {booking.date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      ₫{booking.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
