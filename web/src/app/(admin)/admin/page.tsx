'use client'

import { useState, useEffect } from 'react';

interface RecentBooking {
  id: string;
  user: { displayName?: string; email?: string };
  trip: { route: { name: string } };
  status: string;
  totalAmount: number;
  bookedAt: string;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Bus, Calendar, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { BookingAnalyticsTab } from '@/components/admin-dashboard/BookingAnalyticsTab';
import { RevenueAnalyticsTab } from '@/components/admin-dashboard/RevenueAnalyticsTab';

const statsConfig = [
  {
    name: 'Total Orders',
    key: 'totalOrders',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    trend: 'up',
    change: '',
  },
  {
    name: 'Revenue',
    key: 'totalRevenue',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    trend: 'up',
    change: '',
  },
  {
    name: 'Avg. Transaction',
    key: 'avgTransaction',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    trend: 'up',
    change: '',
  },
  {
    name: 'Unique Customers',
    key: 'uniqueCustomers',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    trend: 'up',
    change: '',
  },
];

// No recentBookings mock, will fetch from API if available in future
// Helper to get default date range (last 7 days)
function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500 text-white';
    case 'pending':
      return 'bg-yellow-500 text-white';
    case 'cancelled':
      return 'bg-red-500 text-white';
    case 'completed':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
};

const TABS = [
  { key: 'revenue', label: 'Revenue Analytics' },
  { key: 'booking', label: 'Booking Analytics' },
];


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div>
      {/* Tabs at the very top */}
      <div className="mb-8 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-6 py-3 font-semibold text-lg border-b-2 transition-all duration-150 focus:outline-none ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-gray-50 dark:bg-gray-900'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'booking' && (
          <div>
            {/* Header for Booking Analytics, styled like Revenue Analytics */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400">Track booking performance, patterns, and conversion metrics</p>
              </div>
            </div>
            <BookingAnalyticsTab />
          </div>
        )}
        {activeTab === 'revenue' && <RevenueAnalyticsTab />}
      </div>
    </div>
  );
}
