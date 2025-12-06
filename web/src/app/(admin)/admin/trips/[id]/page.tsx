'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  Bus,
  Users,
  CheckCircle,
  Phone,
  Mail,
  User,
} from 'lucide-react'
import { TripDetail, TripStatus } from '@/types/trip'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTripDetailsAPI, updateTripAPI } from '@/lib/api'
import { toast } from 'sonner'
import { amenityOptions } from '@/utils/constants'

type TripFormInputs = {
  departureTime: string
  arrivalTime: string
  basePrice: number
  status: TripStatus
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingTrip, setIsEditingTrip] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TripFormInputs>({
    defaultValues: {
      departureTime: '',
      arrivalTime: '',
      basePrice: 0,
      status: 'scheduled',
    },
  })

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true)
        const response = await getTripDetailsAPI(tripId)
        setTrip(response)
        reset({
          departureTime: response.departureTime.slice(0, 16), // Format for datetime-local
          arrivalTime: response.arrivalTime.slice(0, 16),
          basePrice: response.basePrice,
          status: response.status,
        })
      } catch (error) {
        console.error('Error fetching trip details:', error)
        toast.error('Failed to fetch trip details')
      } finally {
        setLoading(false)
      }
    }

    fetchTripDetails()
  }, [tripId, reset])

  const onSubmit: SubmitHandler<TripFormInputs> = async (data) => {
    if (!trip) return

    try {
      await updateTripAPI(trip.id, {
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        basePrice: data.basePrice,
        status: data.status,
      })

      // Refresh trip data
      const refreshedTrip = await getTripDetailsAPI(trip.id)
      setTrip(refreshedTrip)
      setIsEditingTrip(false)
      toast.success('Trip details updated successfully')
    } catch (error) {
      console.error('Error updating trip:', error)
      toast.error('Failed to update trip details')
    }
  }

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500'
      case 'active':
        return 'bg-green-500'
      case 'completed':
        return 'bg-gray-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getSeatStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600'
      case 'locked':
        return 'bg-yellow-500'
      case 'booked':
        return 'bg-gray-400'
      default:
        return 'bg-gray-300'
    }
  }

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'border-purple-400'
      case 'sleeper':
        return 'border-blue-400'
      default:
        return 'border-gray-400'
    }
  }

  if (loading || !trip) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading trip details...</p>
        </div>
      </div>
    )
  }

  const seatsBooked = trip.seats?.filter((s) => s.status === 'booked').length || 0
  const seatsAvailable = trip.seats?.filter((s) => s.status === 'available').length || 0
  const seatsLocked = trip.seats?.filter((s) => s.status === 'locked').length || 0
  const totalSeats = trip.seats?.length || 0
  const occupancyPercentage = totalSeats > 0 ? (seatsBooked / totalSeats) * 100 : 0
  const totalRevenue = trip.bookings?.reduce((sum, booking) => sum + booking.totalAmount, 0) || 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/trips')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Trip Details - {trip.route?.name || trip.routeId}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{trip.bus?.model || 'Unknown Bus'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-white ${getStatusColor(trip.status)}`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trip Information</h2>
                {!isEditingTrip ? (
                  <button
                    onClick={() => setIsEditingTrip(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTrip(false)
                        reset({
                          departureTime: trip.departureTime.slice(0, 16),
                          arrivalTime: trip.arrivalTime.slice(0, 16),
                          basePrice: trip.basePrice,
                          status: trip.status,
                        })
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Trip ID</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{trip.id}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Route</label>
                  <p className="text-gray-900 dark:text-white">{trip.route?.name || trip.routeId}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Departure Time</label>
                  {isEditingTrip ? (
                    <input
                      type="datetime-local"
                      {...register('departureTime', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{new Date(trip.departureTime).toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Arrival Time</label>
                  {isEditingTrip ? (
                    <input
                      type="datetime-local"
                      {...register('arrivalTime', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{new Date(trip.arrivalTime).toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Base Price</label>
                  {isEditingTrip ? (
                    <input
                      type="number"
                      {...register('basePrice', { required: true, valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">₫{trip.basePrice.toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Status</label>
                  {isEditingTrip ? (
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{trip.status}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Seats Booked</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {seatsBooked}/{totalSeats}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Occupancy</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{occupancyPercentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bus Information */}
          {trip.bus && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Bus Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plate Number</span>
                    <span className="text-gray-900 dark:text-white">{trip.bus.plateNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Model</span>
                    <span className="text-gray-900 dark:text-white">{trip.bus.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                    <span className="text-gray-900 dark:text-white">{trip.bus.capacity || 'N/A'} seats</span>
                  </div>
                  {trip.bus.amenities && trip.bus.amenities.length > 0 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-2">Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {trip.bus.amenities.map((amenity) => {
                          const option = amenityOptions.find((a) => a.value === amenity)
                          if (!option) return null
                          const Icon = option.icon
                          return (
                            <div
                              key={amenity}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg"
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{option.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operator Information */}
          {trip.operator && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Operator
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name</span>
                    <span className="text-gray-900 dark:text-white">{trip.operator.name}</span>
                  </div>
                  {trip.operator.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone</span>
                      <a
                        href={`tel:${trip.operator.phone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {trip.operator.phone}
                      </a>
                    </div>
                  )}
                  {trip.operator.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email</span>
                      <a
                        href={`mailto:${trip.operator.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {trip.operator.email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Available</p>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">{seatsAvailable}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Locked</p>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">{seatsLocked}</p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Booked</p>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">{seatsBooked}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Revenue</p>
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">₫{(totalRevenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seat Layout */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seat Layout</h3>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Locked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-4 border-purple-400 bg-white dark:bg-gray-800 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-4 border-blue-400 bg-white dark:bg-gray-800 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sleeper</span>
                </div>
              </div>

              {/* Seat Grid */}
              {trip.seats && trip.seats.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {trip.seats.map((seat) => (
                    <div key={seat.id} className="relative group">
                      <div
                        className={`w-full aspect-square rounded-lg text-white transition-all border-4 flex items-center justify-center ${getSeatStatusColor(
                          seat.status
                        )} ${getSeatTypeColor(seat.seatType)}`}
                      >
                        <span className="text-sm font-semibold">{seat.seatNumber}</span>
                      </div>
                      {seat.status === 'booked' && seat.passengerName && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {seat.passengerName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No seat data available</div>
              )}
            </CardContent>
          </Card>

          {/* Bookings */}
          {trip.bookings && trip.bookings.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bookings ({trip.bookings.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Booking Ref
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Passengers
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {trip.bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                            {booking.bookingRef}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{booking.userName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{booking.passengerCount}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold">
                            ₫{booking.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={`${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Details */}
          {trip.route && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Route Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Route Name</span>
                    <span className="text-gray-900 dark:text-white font-medium">{trip.route.name}</span>
                  </div>
                  {trip.route.distanceKm && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Distance</span>
                      <span className="text-gray-900 dark:text-white">{trip.route.distanceKm} km</span>
                    </div>
                  )}
                  {trip.route.stops && trip.route.stops.length > 0 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-3">Stops ({trip.route.stops.length})</span>
                      <div className="space-y-2">
                        {trip.route.stops.map((stop, index) => (
                          <div
                            key={stop.stopId}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{stop.stopName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{stop.stopAddress}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  <Navigation className="w-3 h-3 inline mr-1" />
                                  {stop.distanceFromOrigin} km
                                </span>
                                <span className="text-xs text-gray-500">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {Math.floor(stop.estimatedMinutes / 60)}h {stop.estimatedMinutes % 60}m
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
