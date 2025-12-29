"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingAnalyticsData } from '@/hooks/useBookingAnalyticsData'
import MetricCard from '@/components/ui/MetricCard'
import DateRangeSelector from '@/components/revenue/DateRangeSelector'
import PopularRoutesRanking from '@/components/booking-analytics/PopularRoutesRanking'
import PeakTimesHeatmap from '@/components/booking-analytics/PeakTimesHeatmap'
import ConversionFunnel from '@/components/booking-analytics/ConversionFunnel'
import SeatOccupancy from '@/components/booking-analytics/SeatOccupancy'

export function BookingAnalyticsTab() {
  const router = useRouter()
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

  const from = dateRange.from ?? '';
  const to = dateRange.to ?? '';

  const { data, loading, error } = useBookingAnalyticsData(from, to)

  return (
    <div className="bg-gray-50 dark:bg-[#10131a] min-h-screen">

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
            {typeof error === 'object' && (error as { message?: string })?.message
              ? (error as { message: string }).message
              : 'An error occurred while fetching booking analytics.'}
          </p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <MetricCard title="Total Bookings" value={data.data?.totalBookings || 0} icon="bookings" />
            <MetricCard title="Conversion Rate" value={Math.round(data.data?.conversionRate || 0)} icon="conversion" />
            <MetricCard title="Seat Occupancy" value={Math.round(data.data?.seatOccupancy || 0)} icon="occupancy" />
            <MetricCard title="Popular Routes" value={data.data?.popularRoutes?.length || 0} icon="routes" onClick={() => router.push('/admin/routes')} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Popular Routes & Conversion Funnel */}
            <PopularRoutesRanking routes={data.data?.popularRoutes || []} />
            <ConversionFunnel funnel={data.data?.funnel || { initiated: 0, confirmed: 0, completed: 0 }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
