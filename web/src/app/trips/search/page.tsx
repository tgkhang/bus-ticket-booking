'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchTripsAPI } from '@/lib/api'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Loader2, 
  Search,
  AlertCircle,
  Bus,
  Wifi,
  Wind,
  Droplet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Stop {
  id: string
  name: string
}

interface Bus {
  model: string
  amenities: string[]
}

interface Trip {
  id: string
  routeId: string
  operatorId: string
  busId: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  status: string
  durationMinutes: number
  originStop: Stop
  destinationStop: Stop
  bus: Bus
}

interface SearchResponse {
  data: Trip[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-4 h-4" />,
  ac: <Wind className="w-4 h-4" />,
  water: <Droplet className="w-4 h-4" />,
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<SearchResponse['meta'] | null>(null)

  const originStopId = searchParams.get('originStopId')
  const destinationStopId = searchParams.get('destinationStopId')
  const date = searchParams.get('date')
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchTrips = async () => {
      if (!originStopId || !destinationStopId || !date) {
        setError('Missing required search parameters')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response: SearchResponse = await searchTripsAPI({
          originStopId,
          destinationStopId,
          date,
          page,
          limit: 10,
          status: 'scheduled',
          sortBy: 'departure',
          sortOrder: 'asc',
        })

        setTrips(response.data || [])
        setMeta(response.meta)
      } catch (err) {
        console.error('Failed to fetch trips:', err)
        setError('Failed to load trips. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [originStopId, destinationStopId, date, page])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching for available trips...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                ← Back to Home
              </button>
            </Link>
          </div>
          
          {trips.length > 0 && (
            <div className="flex items-center gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{trips[0].originStop.name}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{trips[0].destinationStop.name}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{date && formatDate(date)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Bus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Trips Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any trips matching your search criteria. Try adjusting your dates or locations.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                New Search
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {meta?.total || trips.length} {trips.length === 1 ? 'Trip' : 'Trips'} Available
              </h2>
            </div>

            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Time & Route */}
                    <div className="lg:col-span-7">
                      <div className="flex items-center gap-6">
                        {/* Departure */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatTime(trip.departureTime)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{trip.originStop.name}</div>
                        </div>

                        {/* Duration */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-sm text-gray-500 mb-1">
                            {formatDuration(trip.durationMinutes)}
                          </div>
                          <div className="w-full h-px bg-gray-300 relative">
                            <Bus className="w-5 h-5 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatTime(trip.arrivalTime)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{trip.destinationStop.name}</div>
                        </div>
                      </div>

                      {/* Bus Info */}
                      <div className="mt-4 flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Bus:</span> {trip.bus.model}
                        </div>
                        {trip.bus.amenities && trip.bus.amenities.length > 0 && (
                          <div className="flex items-center gap-2">
                            {trip.bus.amenities.slice(0, 3).map((amenity, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                              >
                                {amenityIcons[amenity.toLowerCase()] || null}
                                <span className="capitalize">{amenity}</span>
                              </div>
                            ))}
                            {trip.bus.amenities.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{trip.bus.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="lg:col-span-5 flex items-center justify-between lg:justify-end gap-6">
                      <div className="text-center lg:text-right">
                        <div className="text-sm text-gray-600 mb-1">From</div>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatPrice(trip.basePrice)}
                        </div>
                      </div>
                      <Link href={`/trips/${trip.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                          Select
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('page', pageNum.toString())
                      router.push(`/trips/search?${params.toString()}`)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function TripSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
