'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
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
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Route as RouteIcon,
} from 'lucide-react'
import { TripDetail } from '@/types/trip'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTripDetailsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { amenityOptions } from '@/utils/constants'
import Image from 'next/image'
import {
  organizeSeatsByFloor,
  organizeSeatsByRows,
  getSeatStatusColor,
  getSeatTypeBorderColor,
} from '@/utils/seatLayout'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [map, bounds])
  return null
}

export default function StaffTripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Image slider state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedFloor, setSelectedFloor] = useState(1)

  const handlePrevImage = () => {
    if (trip?.bus?.images && trip.bus.images.length > 0) {
      const imagesLength = trip.bus.images.length
      setCurrentImageIndex((prev) => (prev === 0 ? imagesLength - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (trip?.bus?.images && trip.bus.images.length > 0) {
      const imagesLength = trip.bus.images.length
      setCurrentImageIndex((prev) => (prev === imagesLength - 1 ? 0 : prev + 1))
    }
  }

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true)
        const response = await getTripDetailsAPI(tripId)

        // Parse images if they're stored as JSON string
        if (response.bus && response.bus.images) {
          if (typeof response.bus.images === 'string') {
            try {
              response.bus.images = JSON.parse(response.bus.images)
            } catch (e) {
              console.error('Failed to parse bus images:', e)
              response.bus.images = []
            }
          }
        }

        setTrip(response)
      } catch (error) {
        console.error('Error fetching trip details:', error)
        toast.error('Failed to fetch trip details')
      } finally {
        setLoading(false)
      }
    }

    fetchTripDetails()
  }, [tripId])

  const getStatusColor = (status: string) => {
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

  // Map logic
  const mapPoints = useMemo(() => {
    if (!trip?.route?.stops || trip.route.stops.length === 0) return []

    const pts = trip.route.stops
      .map((rs) => {
        const lat = rs.stop?.latitude
        const lng = rs.stop?.longitude
        if (typeof lat !== 'number' || typeof lng !== 'number') return null

        const stopName = rs.stopName || rs.stop?.name || 'Stop'
        const isFirst = rs.sequence === 1 || rs.sequence === 0
        const isLast = rs.sequence === trip.route!.stops!.length

        let type: 'origin' | 'destination' | 'intermediate' = 'intermediate'
        if (isFirst) type = 'origin'
        else if (isLast) type = 'destination'

        return {
          id: rs.id || rs.stopId,
          name: stopName,
          type,
          lat,
          lng,
        }
      })
      .filter(Boolean) as Array<{
      id: string
      name: string
      type: 'origin' | 'destination' | 'intermediate'
      lat: number
      lng: number
    }>

    return pts
  }, [trip])

  const polyline = useMemo(() => mapPoints.map((p) => [p.lat, p.lng] as [number, number]), [mapPoints])

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (polyline.length < 1) return null
    return polyline as unknown as LatLngBoundsExpression
  }, [polyline])

  if (loading || !trip) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            onClick={() => router.push('/staff/trips')}
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Trip Information</h2>

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
                  <p className="text-gray-900 dark:text-white">{new Date(trip.departureTime).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Arrival Time</label>
                  <p className="text-gray-900 dark:text-white">{new Date(trip.arrivalTime).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Base Price</label>
                  <p className="text-gray-900 dark:text-white">₫{trip.basePrice.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Status</label>
                  <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
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
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {occupancyPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Staff Assignment  */}
          {trip.staff && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Assigned Staff
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                        {trip.staff.user?.displayName?.charAt(0).toUpperCase() ||
                          trip.staff.user?.email?.charAt(0).toUpperCase() ||
                          'S'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {trip.staff.user?.displayName || 'Staff Member'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Assigned to this trip</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-blue-200 dark:border-blue-800">
                      {trip.staff.user?.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <a
                            href={`mailto:${trip.staff.user.email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {trip.staff.user.email}
                          </a>
                        </div>
                      )}
                      {trip.staff.user?.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <a
                            href={`tel:${trip.staff.user.phoneNumber}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {trip.staff.user.phoneNumber}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!trip.staff && trip.status === 'scheduled' && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  Assigned Staff
                </h2>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                    <span>⚠️</span>
                    No staff assigned to this trip yet
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                    <span className="text-gray-900 dark:text-white">{trip.bus.seatCapacity || 'N/A'} seats</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                    <span className="text-gray-900 dark:text-white">{trip.bus.busType || 'N/A'}</span>
                  </div>

                  {/* Bus Images */}
                  {trip.bus.images && trip.bus.images.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          Bus Images
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {currentImageIndex + 1} / {trip.bus.images.length}
                        </span>
                      </div>
                      <div className="relative aspect-3/2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={trip.bus.images[currentImageIndex]}
                          alt={`Bus ${trip.bus.plateNumber} - Image ${currentImageIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        {trip.bus.images.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      {trip.bus.images.length > 1 && (
                        <div className="flex gap-1.5 mt-2 overflow-x-auto">
                          {trip.bus.images.map((imageUrl, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`relative shrink-0 w-16 h-10 rounded overflow-hidden border-2 transition-all ${
                                index === currentImageIndex
                                  ? 'border-blue-500 ring-1 ring-blue-500/50'
                                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                              }`}
                            >
                              <Image
                                src={imageUrl}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {trip.bus.amenities && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400 block mb-2">Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const amenityList = Array.isArray(trip.bus.amenities)
                            ? trip.bus.amenities
                            : Object.entries(trip.bus.amenities)
                                .filter(([, value]) => value === true)
                                .map(([key]) => key)

                          return amenityList.map((amenity) => {
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
                          })
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operator Information */}
          {trip.bus?.operator && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Operator
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name</span>
                    <span className="text-gray-900 dark:text-white">{trip.bus.operator.name}</span>
                  </div>
                  {trip.bus.operator.contactPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone</span>
                      <a
                        href={`tel:${trip.bus.operator.contactPhone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {trip.bus.operator.contactPhone}
                      </a>
                    </div>
                  )}
                  {trip.bus.operator.contactEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email</span>
                      <a
                        href={`mailto:${trip.bus.operator.contactEmail}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {trip.bus.operator.contactEmail}
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
                    <p className="text-gray-900 dark:text-white text-2xl font-bold">
                      ₫{(totalRevenue / 1000).toFixed(0)}K
                    </p>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bus Seat Layout</h3>

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

              {/* Bus Layout View */}
              {trip.seats && trip.seats.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const floorSeats = organizeSeatsByFloor(trip.seats)
                    const floorNumbers = Object.keys(floorSeats).map(Number).sort()
                    const hasMultipleFloors = floorNumbers.length > 1

                    return (
                      <>
                        {/* Floor Tabs */}
                        {hasMultipleFloors && (
                          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                            {floorNumbers.map((floorNum) => (
                              <button
                                key={floorNum}
                                onClick={() => setSelectedFloor(floorNum)}
                                className={`px-4 py-2 font-medium transition-colors ${
                                  selectedFloor === floorNum
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                              >
                                Floor {floorNum}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Display seats */}
                        {floorNumbers.map((floorNum) => {
                          if (hasMultipleFloors && floorNum !== selectedFloor) return null

                          const seatsOnFloor = floorSeats[floorNum] || []
                          const rowSeats = organizeSeatsByRows(seatsOnFloor)
                          const rowNumbers = Object.keys(rowSeats)

                          return (
                            <div key={floorNum} className="space-y-4">
                              {/* Driver section */}
                              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  🚗 Driver {hasMultipleFloors && `- Floor ${floorNum}`}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Front of Bus</span>
                              </div>

                              {/* Seat rows */}
                              <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                {rowNumbers.map((rowNum) => {
                                  const seatsInRow = rowSeats[rowNum]
                                  const sortedSeats = [...seatsInRow].sort((a, b) => {
                                    const colA = a.seatNumber.replace(/\d/g, '')
                                    const colB = b.seatNumber.replace(/\d/g, '')
                                    return colA.localeCompare(colB)
                                  })

                                  const leftSeats: typeof trip.seats = []
                                  const middleSeats: typeof trip.seats = []
                                  const rightSeats: typeof trip.seats = []

                                  const columns = [...new Set(sortedSeats.map((s) => s.seatNumber.replace(/\d/g, '')))]
                                  const totalColumns = columns.length

                                  sortedSeats.forEach((seat) => {
                                    const col = seat.seatNumber.replace(/\d/g, '')
                                    if (totalColumns === 2) {
                                      if (col === 'A') leftSeats.push(seat)
                                      else rightSeats.push(seat)
                                    } else if (totalColumns === 3) {
                                      if (col === 'A') leftSeats.push(seat)
                                      else if (col === 'B') middleSeats.push(seat)
                                      else rightSeats.push(seat)
                                    } else if (totalColumns >= 4) {
                                      if (col === 'A' || col === 'B') leftSeats.push(seat)
                                      else rightSeats.push(seat)
                                    } else {
                                      leftSeats.push(seat)
                                    }
                                  })

                                  return (
                                    <div key={rowNum} className="flex items-center gap-3 justify-center">
                                      {/* Left seats */}
                                      <div className="flex gap-2">
                                        {leftSeats.map((seat) => (
                                          <div key={seat.id} className="relative group">
                                            <div
                                              className={`w-12 h-12 rounded-lg text-white text-xs font-semibold transition-all border-4 flex items-center justify-center ${getSeatStatusColor(
                                                seat.status
                                              )} ${getSeatTypeBorderColor(seat.seatType)}`}
                                              title={`${seat.seatNumber} - ${seat.seatType} (${seat.status})`}
                                            >
                                              {seat.seatNumber}
                                            </div>
                                            {seat.status === 'booked' && seat.passengerName && (
                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {seat.passengerName}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      {/* Aisle */}
                                      <div className="w-8 border-l-2 border-r-2 border-dashed border-gray-300 dark:border-gray-600 h-12"></div>

                                      {/* Middle seats */}
                                      {middleSeats.length > 0 && (
                                        <>
                                          <div className="flex gap-2">
                                            {middleSeats.map((seat) => (
                                              <div key={seat.id} className="relative group">
                                                <div
                                                  className={`w-12 h-12 rounded-lg text-white text-xs font-semibold transition-all border-4 flex items-center justify-center ${getSeatStatusColor(
                                                    seat.status
                                                  )} ${getSeatTypeBorderColor(seat.seatType)}`}
                                                  title={`${seat.seatNumber} - ${seat.seatType} (${seat.status})`}
                                                >
                                                  {seat.seatNumber}
                                                </div>
                                                {seat.status === 'booked' && seat.passengerName && (
                                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                    {seat.passengerName}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                          <div className="w-8 border-l-2 border-r-2 border-dashed border-gray-300 dark:border-gray-600 h-12"></div>
                                        </>
                                      )}

                                      {/* Right seats */}
                                      <div className="flex gap-2">
                                        {rightSeats.map((seat) => (
                                          <div key={seat.id} className="relative group">
                                            <div
                                              className={`w-12 h-12 rounded-lg text-white text-xs font-semibold transition-all border-4 flex items-center justify-center ${getSeatStatusColor(
                                                seat.status
                                              )} ${getSeatTypeBorderColor(seat.seatType)}`}
                                              title={`${seat.seatNumber} - ${seat.seatType} (${seat.status})`}
                                            >
                                              {seat.seatNumber}
                                            </div>
                                            {seat.status === 'booked' && seat.passengerName && (
                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {seat.passengerName}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}
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
                      <span className="text-gray-600 dark:text-gray-400 block mb-3">
                        Stops ({trip.route.stops.length})
                      </span>
                      <div className="space-y-2">
                        {trip.route.stops.map((routeStop, index) => {
                          const stopName = routeStop.stopName || routeStop.stop?.name || 'Unknown Stop'
                          const stopAddress = routeStop.stopAddress || routeStop.stop?.address || ''
                          const distanceFromOrigin = routeStop.distanceFromOrigin || 0
                          const estimatedMinutes = routeStop.estimatedMinutes || 0

                          return (
                            <div
                              key={routeStop.stopId || routeStop.id}
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                                  {routeStop.sequence || index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{stopName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stopAddress}</p>
                                {(distanceFromOrigin > 0 || estimatedMinutes > 0) && (
                                  <div className="flex gap-3 mt-1">
                                    {distanceFromOrigin > 0 && (
                                      <span className="text-xs text-gray-500">
                                        <Navigation className="w-3 h-3 inline mr-1" />
                                        {distanceFromOrigin} km
                                      </span>
                                    )}
                                    {estimatedMinutes > 0 && (
                                      <span className="text-xs text-gray-500">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {Math.floor(estimatedMinutes / 60)}h {estimatedMinutes % 60}m
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="flex gap-2 mt-2">
                                  {routeStop.isPickup !== undefined && (
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs ${
                                        routeStop.isPickup
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                                      }`}
                                    >
                                      {routeStop.isPickup ? '✓ Pickup' : '✗ No Pickup'}
                                    </span>
                                  )}
                                  {routeStop.isDropoff !== undefined && (
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs ${
                                        routeStop.isDropoff
                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                                      }`}
                                    >
                                      {routeStop.isDropoff ? '✓ Drop-off' : '✗ No Drop-off'}
                                    </span>
                                  )}
                                </div>
                              </div>
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

          {/* Route Map */}
          {bounds && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <RouteIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Route Map
                </h3>
                <div className="h-[360px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                  <MapContainer
                    center={polyline[0] || [10.7758, 106.7009]}
                    zoom={11}
                    scrollWheelZoom
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitBounds bounds={bounds} />
                    {polyline.length >= 2 && <Polyline positions={polyline} />}
                    {mapPoints.map((p) => (
                      <CircleMarker
                        key={p.id}
                        center={[p.lat, p.lng]}
                        radius={p.type === 'origin' || p.type === 'destination' ? 8 : 6}
                        pathOptions={{
                          color: p.type === 'origin' ? '#10B981' : p.type === 'destination' ? '#EF4444' : '#3B82F6',
                          fillColor: p.type === 'origin' ? '#10B981' : p.type === 'destination' ? '#EF4444' : '#3B82F6',
                          fillOpacity: 0.8,
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                          <div className="text-xs">
                            <div className="font-semibold">{p.name}</div>
                            <div>
                              {p.type === 'origin' ? 'Origin' : p.type === 'destination' ? 'Destination' : 'Stop'}
                            </div>
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
