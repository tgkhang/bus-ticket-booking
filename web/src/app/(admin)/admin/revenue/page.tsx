"use client";
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { useRevenueData } from '@/hooks/useRevenueData'
import MetricCard from '@/components/revenue/MetricCard'
import DateRangeSelector from '@/components/revenue/DateRangeSelector'
import RevenueLineChart from '@/components/revenue/RevenueLineChart'
import PaymentMethodPieChart from '@/components/revenue/PaymentMethodPieChart'
import RevenueByRouteBarChart from '@/components/revenue/RevenueByRouteBarChart'

export default function RevenueDashboardPage() {
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(() => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 6); // 7 ngày gần nhất (bao gồm hôm nay)
    const toStr = today.toISOString().slice(0, 10);
    const fromStr = fromDate.toISOString().slice(0, 10);
    return { from: fromStr, to: toStr };
  });

  // Thêm state cho filter range
  const [activeRange, setActiveRange] = useState<'7' | '30' | '90' | null>('7');

  // Hàm xử lý khi chọn filter
  const handleRangeClick = (days: 7 | 30 | 90) => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - (days - 1));
    setDateRange({
      from: fromDate.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
    });
    setActiveRange(days.toString() as '7' | '30' | '90');
  };

  const from = dateRange.from
  const to = dateRange.to

  const { overview, byRoute, byPayment, loading, error } = useRevenueData(from || '', to || '')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track revenue performance and trends over time</p>
        </div>
      </div>


      {/* Date Range Filter + Selector */}
      <div className="mb-10 flex flex-wrap gap-3 items-center">
        <button
          className={`px-4 py-2 rounded-lg border font-medium transition-all duration-150 ${
            activeRange === '7'
              ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400 dark:bg-blue-500 dark:text-white'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleRangeClick(7)}
        >
          Last 7 days
        </button>
        <button
          className={`px-4 py-2 rounded-lg border font-medium transition-all duration-150 ${
            activeRange === '30'
              ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400 dark:bg-blue-500 dark:text-white'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleRangeClick(30)}
        >
          Last 30 days
        </button>
        <button
          className={`px-4 py-2 rounded-lg border font-medium transition-all duration-150 ${
            activeRange === '90'
              ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400 dark:bg-blue-500 dark:text-white'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleRangeClick(90)}
        >
          Last 90 days
        </button>
        <div className="ml-4">
          <DateRangeSelector value={dateRange} onChange={dr => { setDateRange(dr); setActiveRange(null); }} />
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center py-12 text-gray-500">Loading data...</div>}
      {error && (
        <div className="text-center py-12 text-red-500">
          {typeof error === 'string' ? error : error?.message || 'Failed to load data'}
        </div>
      )}

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <MetricCard title="Total Revenue" value={overview?.data?.totalRevenue || 0} icon="revenue" />
          <MetricCard title="Avg. Transaction" value={overview?.data?.avgTransaction || 0} icon="avg" />
          <MetricCard title="Total Orders" value={overview?.data?.totalOrders || 0} icon="orders" />
          <MetricCard title="Unique Customers" value={overview?.data?.uniqueCustomers || 0} icon="customers" />
        </div>
      )}

      {/* Charts */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <Card className="rounded-2xl hover:shadow-xl transition-all duration-150">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
                <div className="h-80 flex items-center justify-center">
                  {overview?.data?.revenueOverTime?.length ? (
                    <RevenueLineChart data={overview?.data?.revenueOverTime} />
                  ) : (
                    <span className="text-gray-400">No data</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl hover:shadow-xl transition-all duration-150">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method Breakdown</h3>
                <div className="h-80 flex items-center justify-center">
                  {byPayment?.data?.length ? (
                    <PaymentMethodPieChart data={byPayment.data} />
                  ) : (
                    <span className="text-gray-400">No data</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl hover:shadow-xl transition-all duration-150">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Route</h3>
              <div className="h-80 flex items-center justify-center">
                {byRoute?.data?.length ? (
                  <RevenueByRouteBarChart data={byRoute.data} />
                ) : (
                  <span className="text-gray-400">No data</span>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}