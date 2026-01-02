'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Plus,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Trip, TripStatus, CreateTripData } from '@/types/trip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listTripsAPI, deleteTripAPI, createTripAPI, listRoutesAPI, listBusesAPI } from '@/lib/api'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/utils/constants'
import type { Route } from '@/types/routeAndStop'
import type { Bus } from '@/types/api'
import { useAuth } from '@/hooks/useAuth'

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
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(false)
  const [loadingBuses, setLoadingBuses] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get operator ID from current user
  const operatorId = user?.operatorId

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

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

  // Fetch trips and reference data on component mount
  useEffect(() => {
    if (operatorId) {
      fetchTrips()
      fetchRoutes()
      fetchBuses()
    }
  }, [operatorId])

  const fetchTrips = async () => {
    if (!operatorId) return

    try {
      setLoading(true)
      const response = await listTripsAPI({ operatorId }, { page: 1, limit: 100 })
      setTrips(response.data)
    } catch (error) {
      toast.error('Failed to fetch trips')
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutes = async () => {
    if (!operatorId) return

    try {
      setLoadingRoutes(true)
      const response = await listRoutesAPI({ operatorId }, { page: 1, limit: 100 })
      setRoutes(response.data)
    } catch (error) {
      toast.error('Failed to fetch routes')
      console.error('Error fetching routes:', error)
    } finally {
      setLoadingRoutes(false)
    }
  }

  const fetchBuses = async () => {
    if (!operatorId) return

    try {
      setLoadingBuses(true)
      const response = await listBusesAPI({ operatorId }, { page: 1, limit: 100 })
      setBuses(response.data)
    } catch (error) {
      toast.error('Failed to fetch buses')
      console.error('Error fetching buses:', error)
    } finally {
      setLoadingBuses(false)
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

  const onSubmit = async (data: TripFormData) => {
    try {
      const createData: CreateTripData = {
        routeId: data.routeId,
        busId: data.busId,
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        basePrice: data.basePrice,
        status: data.status,
      }
      await createTripAPI(createData)

      // Refresh the trip list
      await fetchTrips()
      handleCloseModal()
    } catch (error) {
      console.error('Error creating trip:', error)
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
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  // Filter trips based on search query
  const filteredTrips = trips.filter((trip) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const routeName = getRouteName(trip.routeId).toLowerCase()
    const busInfo = getBusInfo(trip.busId)
    return (
      routeName.includes(query) ||
      busInfo.plateNumber.toLowerCase().includes(query) ||
      busInfo.model.toLowerCase().includes(query) ||
      trip.status.toLowerCase().includes(query)
    )
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentTrips = filteredTrips.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
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

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by route, bus plate, model, or status..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Trips Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading trips...</div>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">No trips found. Add one to get started!</div>
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
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Arrival
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Price
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
                  {currentTrips.map((trip) => {
                    const busInfo = getBusInfo(trip.busId)
                    return (
                      <tr
                        key={trip.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => router.push(`/operator/trips/${trip.id}`)}
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
                                router.push(`/operator/trips/${trip.id}`)
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
          {!loading && filteredTrips.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTrips.length)} of {filteredTrips.length} trips
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
