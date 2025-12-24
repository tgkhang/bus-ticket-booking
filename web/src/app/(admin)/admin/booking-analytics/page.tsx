'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { useBookingAnalyticsData } from '@/hooks/useBookingAnalyticsData'
import BookingMetricCard from '@/components/booking-analytics/BookingMetricCard'
import DateRangeSelector from '@/components/revenue/DateRangeSelector' // Đã nâng cấp trước đó
import PopularRoutesRanking from '@/components/booking-analytics/PopularRoutesRanking'
import PeakTimesHeatmap from '@/components/booking-analytics/PeakTimesHeatmap'
import ConversionFunnel from '@/components/booking-analytics/ConversionFunnel'
import SeatOccupancy from '@/components/booking-analytics/SeatOccupancy'

export default function BookingAnalyticsDashboardPage() {
  const today = new Date();
  const getRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  };

  // Default: last 7 days
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(() => getRange(7));
  const [activeRange, setActiveRange] = useState<7 | 30 | 90>(7);

  const from = dateRange.from || undefined;
  const to = dateRange.to || undefined;

  const { data, loading, error } = useBookingAnalyticsData(from, to)

  return (
    <div className="px-2 py-4 md:px-8 md:py-8 bg-gray-50 dark:bg-[#10131a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Booking Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base mt-1">Track booking performance, patterns, and conversion metrics</p>
        </div>
      </div>

      {/* Date Range Filter + Selector */}
      <div className="mb-10 flex flex-wrap gap-3 items-center">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 ${
              activeRange === days
                ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400 dark:bg-blue-500 dark:text-white'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
            onClick={() => { setDateRange(getRange(days)); setActiveRange(days as 7 | 30 | 90); }}
          >
            Last {days} days
          </button>
        ))}
        <div className="ml-4">
          <DateRangeSelector value={dateRange} onChange={dr => { setDateRange(dr); setActiveRange(undefined as any); }} />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg font-medium">Loading booking analytics...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center mb-8">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Failed to Load Data</h3>
          <p className="text-red-700 dark:text-red-400">
            {typeof error === 'object' && error?.message ? error.message : 'An error occurred while fetching booking analytics.'}
          </p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <BookingMetricCard title="Total Bookings" value={data.data?.totalBookings || 0} icon="bookings" />
            <BookingMetricCard title="Conversion Rate" value={Math.round(data.data?.conversionRate || 0)} icon="conversion" />
            <BookingMetricCard title="Seat Occupancy" value={Math.round(data.data?.seatOccupancy || 0)} icon="occupancy" />
            <BookingMetricCard title="Popular Routes" value={data.data?.popularRoutes?.length || 0} icon="routes" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
            {/* Popular Routes & Conversion Funnel */}
            <PopularRoutesRanking routes={data.data?.popularRoutes || []} />
            <ConversionFunnel funnel={data.data?.funnel || { initiated: 0, confirmed: 0, completed: 0 }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Peak Times Heatmap */}
            <PeakTimesHeatmap peakTimes={data.data?.peakTimes || []} />

            {/* Seat Occupancy */}
            <SeatOccupancy occupancy={data.data?.seatOccupancy || 0} />
          </div>
        </>
      )}
    </div>
  )
}