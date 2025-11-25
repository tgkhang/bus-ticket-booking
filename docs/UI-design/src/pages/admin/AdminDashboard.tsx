import AdminLayout from '../../components/AdminLayout';
import { DollarSign, Bus, Calendar, Users, TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Total Bookings',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Trips',
      value: '48',
      change: '+5.2%',
      trend: 'up',
      icon: Bus,
      color: 'bg-green-500',
    },
    {
      name: 'Revenue',
      value: '₫24.5M',
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Users',
      value: '892',
      change: '-2.1%',
      trend: 'down',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

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
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#10B981] text-white';
      case 'pending':
        return 'bg-[#F59E0B] text-white';
      case 'cancelled':
        return 'bg-[#EF4444] text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      stat.trend === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600">{stat.name}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-gray-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Booking ID</th>
                  <th className="px-6 py-3 text-left text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-gray-700">Route</th>
                  <th className="px-6 py-3 text-left text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4 text-gray-900">{booking.customer}</td>
                    <td className="px-6 py-4 text-gray-900">{booking.route}</td>
                    <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      ₫{booking.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
