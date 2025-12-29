'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Plus,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  SlidersHorizontal,
} from 'lucide-react'
import { Trip, TripStatus, CreateTripData } from '@/types/trip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listTripsAPI, deleteTripAPI, createTripAPI, listRoutesAPI, listBusesAPI, listOperatorsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/utils/constants'
import { datetimeLocalGmt7ToIso, formatDateOnlyGmt7, formatDateTimeGmt7 } from '@/lib/utils/datetime'
import type { Route } from '@/types/routeAndStop'
import type { Bus } from '@/types/api'
import type { Operator } from '@/types/operator'

interface TripFormData {
  routeId: string
  busId: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  status: TripStatus
}

export default function TripManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [trips, setTrips] = useState<Trip[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(false)
  const [loadingBuses, setLoadingBuses] = useState(false)
  const [loadingOperators, setLoadingOperators] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [totalItems, setTotalItems] = useState(0)

  // Get params from URL
  const searchQuery = searchParams.get('search') || ''
  const routeFilter = searchParams.get('routeId') || ''
  const statusFilter = searchParams.get('status') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const sortBy = searchParams.get('sortBy') || 'departureTime'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Local state for form inputs
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [routeInput, setRouteInput] = useState(routeFilter)
  const [statusInput, setStatusInput] = useState(statusFilter)
  const [dateFromInput, setDateFromInput] = useState(dateFrom)
  const [dateToInput, setDateToInput] = useState(dateTo)

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    defaultValues: {
      routeId: '',
      busId: '',
      departureTime: '',
      arrivalTime: '',
      basePrice: 0,
      status: 'scheduled',
    },
  })

  // Update URL when filters/search/sort change
  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      
      // Reset to page 1 when filters change (unless page is being set)
      if (!params.page) {
        newParams.set('page', '1')
      }
      
      router.push(`?${newParams.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  // Fetch trips with filters and pagination
  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true)
      const filters: Record<string, string> = {}
      
      if (searchQuery) filters.search = searchQuery
      if (routeFilter) filters.routeId = routeFilter
      if (statusFilter) filters.status = statusFilter
      if (dateFrom) filters.dateFrom = dateFrom
      if (dateTo) filters.dateTo = dateTo
      if (sortBy) filters.sortBy = sortBy
      if (sortOrder) filters.sortOrder = sortOrder

      const response = await listTripsAPI(filters, { 
        page: currentPage, 
        limit: ITEMS_PER_PAGE,
      })
      
      setTrips(response.data)
      const total = response.pagination?.total ?? (response as any)?.total ?? 0
      setTotalItems(total)
    } catch (error) {
      toast.error('Failed to fetch trips')
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, routeFilter, statusFilter, dateFrom, dateTo, sortBy, sortOrder, currentPage])

  // Fetch trips and reference data on component mount and when filters change
  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    fetchRoutes()
    fetchBuses()
    fetchOperators()
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true)
      const response = await listRoutesAPI({}, { page: 1, limit: 100 })
      setRoutes(response.data)
    } catch (error) {
      toast.error('Failed to fetch routes')
      console.error('Error fetching routes:', error)
    } finally {
      setLoadingRoutes(false)
    }
  }

  const fetchBuses = async () => {
    try {
      setLoadingBuses(true)
      const response = await listBusesAPI({}, { page: 1, limit: 100 })
      setBuses(response.data)
    } catch (error) {
      toast.error('Failed to fetch buses')
      console.error('Error fetching buses:', error)
    } finally {
      setLoadingBuses(false)
    }
  }

  const fetchOperators = async () => {
    try {
      setLoadingOperators(true)
      const response = await listOperatorsAPI({ status: 'approved' }, { page: 1, limit: 100 })
      setOperators(response.data)
    } catch (error) {
      toast.error('Failed to fetch operators')
      console.error('Error fetching operators:', error)
    } finally {
      setLoadingOperators(false)
    }
  }

  const handleOpenModal = () => {
    reset({
      routeId: '',
      busId: '',
      departureTime: '',
      arrivalTime: '',
      basePrice: 0,
      status: 'scheduled',
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    reset()
  }

  // Handle search
  const handleSearch = () => {
    updateURL({
      search: searchInput,
      routeId: routeInput,
      status: statusInput,
      dateFrom: dateFromInput,
      dateTo: dateToInput,
    })
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchInput('')
    setRouteInput('')
    setStatusInput('')
    setDateFromInput('')
    setDateToInput('')
    updateURL({
      search: '',
      routeId: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc'
    updateURL({
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    })
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (data: TripFormData) => {
    try {
      const createData: CreateTripData = {
        routeId: data.routeId,
        busId: data.busId,
        departureTime: datetimeLocalGmt7ToIso(data.departureTime),
        arrivalTime: datetimeLocalGmt7ToIso(data.arrivalTime),
        basePrice: data.basePrice,
        status: data.status,
      }
      await createTripAPI(createData)

      // Refresh the trip list
      await fetchTrips()
      handleCloseModal()
      toast.success('Trip created successfully')
    } catch (error) {
      console.error('Error creating trip:', error)
      toast.error('Failed to create trip')
    }
  }

  const handleOpenDeleteModal = (trip: Trip) => {
    setDeletingTrip(trip)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingTrip(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTrip) return

    try {
      setIsDeleting(true)
      await deleteTripAPI(deletingTrip.id)
      await fetchTrips()
      handleCloseDeleteModal()
    } catch (error) {
      toast.error('Failed to delete trip')
      console.error('Error deleting trip:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500 text-white'
      case 'active':
        return 'bg-green-500 text-white'
      case 'completed':
        return 'bg-gray-500 text-white'
      case 'cancelled':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDateTime = (dateStr: string) => {
    return formatDateTimeGmt7(dateStr)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // Helper to get route name from routeId
  const getRouteName = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId)
    return route?.name || routeId
  }

  // Helper to get bus info from busId
  const getBusInfo = (busId: string) => {
    const bus = buses.find((b) => b.id === busId)
    return bus ? { model: bus.model, plateNumber: bus.plateNumber } : { model: 'Unknown', plateNumber: busId }
  }

  // Trips are sorted server-side based on sortBy/sortOrder.
  const displayTrips = trips

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  // Generate pagination range
  const getPaginationRange = () => {
    const delta = 2
    const range: (number | string)[] = []
    const rangeWithDots: (number | string)[] = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const hasActiveFilters = searchQuery || routeFilter || statusFilter || dateFrom || dateTo

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trip Management</h1>
          <p className="text-gray-600">Manage your bus trips</p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-6 text-base"
        >
          <Plus className="w-6 h-6" />
          Add New Trip
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar and Filter Toggle */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by route, bus, or operator..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="px-6 py-3 flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Route
                    </label>
                    <select
                      value={routeInput}
                      onChange={(e) => setRouteInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={loadingRoutes}
                    >
                      <option value="">All Routes</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={dateFromInput}
                      onChange={(e) => setDateFromInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateToInput}
                      onChange={(e) => setDateToInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Apply Filters
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="px-6 py-2"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    Search: {searchQuery}
                  </span>
                )}
                {routeFilter && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    Route: {getRouteName(routeFilter)}
                  </span>
                )}
                {statusFilter && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    Status: {statusFilter}
                  </span>
                )}
                {dateFrom && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    From: {formatDateOnlyGmt7(dateFrom)}
                  </span>
                )}
                {dateTo && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    To: {formatDateOnlyGmt7(dateTo)}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trips Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading trips...</div>
            </div>
          ) : displayTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-center">
                {hasActiveFilters ? 'No trips found matching your filters.' : 'No trips found. Add one to get started!'}
              </div>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Trip ID
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Bus
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSortChange('departureTime')}
                    >
                      <div className="flex items-center gap-2">
                        Departure
                        {sortBy === 'departureTime' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Arrival
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Price
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSortChange('booking')}
                    >
                      <div className="flex items-center gap-2">
                        Bookings
                        {sortBy === 'booking' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayTrips.map((trip) => {
                    const busInfo = getBusInfo(trip.busId)
                    return (
                      <tr
                        key={trip.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/trips/${trip.id}`)}
                      >
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">
                          <span className="font-mono text-sm">{trip.id.substring(0, 8)}...</span>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">{getRouteName(trip.routeId)}</td>
                        <td className="px-6 py-4">
                          <div className="text-base text-gray-900 dark:text-gray-100">{busInfo.model}</div>
                          <div className="text-sm text-gray-500">{busInfo.plateNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">
                          {formatDateTime(trip.departureTime)}
                        </td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">
                          {formatDateTime(trip.arrivalTime)}
                        </td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">
                          {formatCurrency(trip.basePrice)}
                        </td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">
                          {trip.seatsBooked || 0} / {trip.totalSeats || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/admin/trips/${trip.id}`)
                              }}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="Edit trip"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenDeleteModal(trip)
                              }}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Delete trip"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && displayTrips.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} trips
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {getPaginationRange().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-600 dark:text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  )
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h2>
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">Are you sure you want to delete this trip?</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Trip ID: </span>
                  <span className="text-gray-700 dark:text-gray-300">{deletingTrip.id.substring(0, 8)}...</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Route: </span>
                  <span className="text-gray-700 dark:text-gray-300">{getRouteName(deletingTrip.routeId)}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Departure: </span>
                  <span className="text-gray-700 dark:text-gray-300">{formatDateTime(deletingTrip.departureTime)}</span>
                </p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-4">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="flex-1 bg-white dark:bg-gray-800 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Trip'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Trip</h2>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route</label>
                    <select
                      {...register('routeId', { required: 'Route is required' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={loadingRoutes}
                    >
                      <option value="">{loadingRoutes ? 'Loading routes...' : 'Select a route'}</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name}
                        </option>
                      ))}
                    </select>
                    {errors.routeId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.routeId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bus</label>
                    <select
                      {...register('busId', { required: 'Bus is required' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={loadingBuses}
                    >
                      <option value="">{loadingBuses ? 'Loading buses...' : 'Select a bus'}</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.model} - {bus.plateNumber}
                        </option>
                      ))}
                    </select>
                    {errors.busId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.busId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Departure Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('departureTime', { required: 'Departure time is required' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    {errors.departureTime && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.departureTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Arrival Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('arrivalTime', { required: 'Arrival time is required' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    {errors.arrivalTime && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.arrivalTime.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base Price (VND)
                    </label>
                    <input
                      type="number"
                      {...register('basePrice', {
                        required: 'Base price is required',
                        min: { value: 0, message: 'Base price must be at least 0' },
                        valueAsNumber: true,
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    {errors.basePrice && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.basePrice.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Add Trip'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-white dark:bg-gray-800 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
