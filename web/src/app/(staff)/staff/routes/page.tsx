'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Clock, Map as MapIcon, ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Route, Stop } from '@/types/routeAndStop'
import { listOperatorsAPI, listRoutesAPI, listStopsAPI } from '@/lib/api'
import { toast } from 'sonner'
import type { Operator } from '@/types/operator'
import { useRouter } from 'next/navigation'
import { ITEMS_PER_PAGE } from '@/utils/constants'
import { useAuth } from '@/hooks/useAuth'

export default function RoutesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [availableStops, setAvailableStops] = useState<Stop[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter routes based on search query
  const filteredRoutes = routes?.filter((route) => {
    const query = searchQuery.toLowerCase()
    const originName = route.originStop?.name?.toLowerCase() || ''
    const destName = route.destinationStop?.name?.toLowerCase() || ''

    return (
      route.name.toLowerCase().includes(query) ||
      originName.includes(query) ||
      destName.includes(query)
    )
  }) || []

  // Pagination calculations
  const totalPages = Math.ceil((filteredRoutes?.length || 0) / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentRoutes = filteredRoutes?.slice(indexOfFirstItem, indexOfLastItem) || []

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [operatorsResponse, stopsResponse, routesResponse] = await Promise.all([
          listOperatorsAPI({ status: 'approved' }, { page: 1, limit: 100 }),
          listStopsAPI({ active: true }, { page: 1, limit: 500 }),
          listRoutesAPI(
            {
              operatorId: user?.operatorId,
            },
            { page: 1, limit: 10 }
          ),
        ])
        setOperators(operatorsResponse.data)
        setAvailableStops(stopsResponse.data)
        setRoutes(routesResponse.data)
      } catch (error) {
        toast.error('Failed to fetch data')
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Operator Routes</h1>
          <p className="text-gray-600 dark:text-gray-400">{user?.operatorName}</p>
        </div>
      </div>

      {/* Search Panel */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by route name, origin, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Routes</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{routes?.length || 0}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Active Routes</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {routes?.filter((r) => r.active).length || 0}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <MapIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Stops</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{availableStops?.length || 0}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Avg. Distance</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {routes?.length > 0
                    ? Math.round(routes.reduce((acc, r) => acc + r.distanceKm, 0) / routes.length)
                    : 0}{' '}
                  km
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading routes...</div>
            </div>
          ) : !routes || routes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">No routes found. Add one to get started!</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[15%]" />
                  {/* Route Name */}
                  <col className="w-[15%]" />
                  {/* Operator */}
                  <col className="w-[20%]" />
                  {/* Origin → Destination */}
                  <col className="w-[10%]" />
                  {/* Stops */}
                  <col className="w-[8%]" />
                  {/* Distance */}
                  <col className="w-[10%]" />
                  {/* Duration */}
                  <col className="w-[8%]" />
                  {/* Status */}
                </colgroup>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Route Name
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Origin → Destination
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Stops
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => router.push(`/staff/routes/${route.id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-base text-gray-900 dark:text-white font-medium">{route.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
                          {route.operator.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {route.originStop.name}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {route.destinationStop.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm whitespace-nowrap">
                          {route.stops.length} stops
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base text-gray-900 dark:text-white whitespace-nowrap">
                          {route.distanceKm} km
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white whitespace-nowrap">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {Math.floor(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}m
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {route.active ? (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm whitespace-nowrap">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-sm whitespace-nowrap">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {!loading && routes && routes.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, routes?.length || 0)} of{' '}
                {routes?.length || 0} routes
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
