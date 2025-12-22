'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getTripByIdAPI, searchTripsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import TripCard from '@/components/common/TripCard'
import {
  MapPin,
  Calendar,
  Clock,
  Bus,
  Star,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  Info,
  Navigation,
  Route,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'

// Mock Reviews Data
const MOCK_REVIEWS = [
  {
    id: 1,
    user: 'Alice Nguyen',
    rating: 5,
    date: '2023-10-15',
    comment: 'Great trip! The bus was clean and on time. The driver was very professional.',
    avatar: 'AN'
  },
  {
    id: 2,
    user: 'Minh Tran',
    rating: 4,
    date: '2023-10-12',
    comment: 'Comfortable seats, but the wifi was a bit spotty. Overall good experience.',
    avatar: 'MT'
  },
  {
    id: 3,
    user: 'Sarah Le',
    rating: 5,
    date: '2023-10-05',
    comment: 'Excellent service. Will definitely book again.',
    avatar: 'SL'
  }
]

type Stop = {
  id: string
  name: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

type RouteStop = {
  id: string
  sequence?: number | null
  isPickup?: boolean | null
  isDropoff?: boolean | null
  note?: string | null
  stop: Stop
}

type TripDetailApi = {
  id: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  status?: string
  route: {
    id: string
    name?: string
    distanceKm?: number | null
    estimatedMinutes?: number | null
    originStop: Stop
    destinationStop: Stop
    stops?: RouteStop[]
  }
  bus?: {
    id?: string
    model?: string
    plateNumber?: string
    seatCapacity?: number
    operator?: { id?: string; name?: string }
    amenities?: Record<string, boolean> | string[] | null
    images?: string[]
  }
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [map, bounds])
  return null
}

function AmenityBadges({ amenities }: { amenities?: TripDetailApi['bus'] extends infer B ? (B extends { amenities?: infer A } ? A : never) : never }) {
  if (!amenities) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No amenities info provided.</p>
  }

  // Backend sometimes returns { wifi: true, ... } and sometimes an array of strings
  const items: string[] = Array.isArray(amenities)
    ? amenities
    : Object.entries(amenities)
        .filter(([, v]) => !!v)
        .map(([k]) => k)

  if (items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No amenities listed.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k) => (
        <Badge key={k} variant="default" className="capitalize">
          {k.replaceAll('_', ' ')}
        </Badge>
      ))}
    </div>
  )
}

export default function TripDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [trip, setTrip] = useState<TripDetailApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [alternativeTrips, setAlternativeTrips] = useState<any[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
    const fetchTrip = async () => {
      try {
        const data = await getTripByIdAPI(params.id as string)

        // Parse images if they're stored as JSON string
        if (data.bus && data.bus.images) {
          if (typeof data.bus.images === 'string') {
            try {
              data.bus.images = JSON.parse(data.bus.images)
            } catch (e) {
              console.error('Failed to parse bus images:', e)
              data.bus.images = []
            }
          }
        }

        setTrip(data as TripDetailApi)
      } catch (error) {
        console.error('Failed to fetch trip details:', error)
        toast.error('Failed to load trip details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTrip()
    }
  }, [params.id])

  useEffect(() => {
    const fetchAlternatives = async () => {
      if (!trip) return

      try {
        // 1. Search same day
        const date = new Date(trip.departureTime).toISOString().split('T')[0]
        const results: any = await searchTripsAPI({
          originStopId: trip.route.originStop.id,
          destinationStopId: trip.route.destinationStop.id,
          date: date,
          limit: 5 // Fetch a few more to filter out current
        })

        let alts = (results.data || []).filter((t: any) => t.id !== trip.id)

        // 2. If not enough, search next day
        if (alts.length < 3) {
          const nextDate = new Date(date)
          nextDate.setDate(nextDate.getDate() + 1)
          const nextDateStr = nextDate.toISOString().split('T')[0]

          const nextDayResults: any = await searchTripsAPI({
            originStopId: trip.route.originStop.id,
            destinationStopId: trip.route.destinationStop.id,
            date: nextDateStr,
            limit: 3
          })

          alts = [...alts, ...(nextDayResults.data || [])]
        }

        setAlternativeTrips(alts.slice(0, 3))
      } catch (err) {
        console.error("Failed to fetch alternatives", err)
      }
    }

    if (trip) {
      fetchAlternatives()
    }
  }, [trip])

  const passengers = Math.max(1, Number(searchParams.get('passengers') || '1') || 1)
  const routeStops = trip?.route?.stops || []
  const originStop = trip?.route?.originStop
  const destinationStop = trip?.route?.destinationStop

  const intermediateStops = useMemo(() => {
    const originId = originStop?.id
    const destinationId = destinationStop?.id

    // Make sequence ordering stable if the backend provides it
    const sorted = [...routeStops].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))

    // Some APIs include origin/destination again inside `route.stops`.
    // Filter them out and de-duplicate by stop id.
    const seenStopIds = new Set<string>()
    const cleaned: RouteStop[] = []

    for (const rs of sorted) {
      const stopId = rs.stop?.id
      if (!stopId) continue
      if (originId && stopId === originId) continue
      if (destinationId && stopId === destinationId) continue
      if (seenStopIds.has(stopId)) continue
      seenStopIds.add(stopId)
      cleaned.push(rs)
    }

    return cleaned
  }, [routeStops, originStop?.id, destinationStop?.id])

  const allStops = useMemo(() => {
    if (!trip || !originStop || !destinationStop) return []
    return [
      {
        id: `origin-${originStop.id}`,
        stop: originStop,
        type: 'origin' as const,
        isPickup: true,
        isDropoff: false,
        time: trip.departureTime,
      },
      ...intermediateStops.map((rs) => ({
        id: rs.id,
        stop: rs.stop,
        type: 'intermediate' as const,
        isPickup: !!rs.isPickup,
        isDropoff: !!rs.isDropoff,
        time: null as string | null,
      })),
      {
        id: `destination-${destinationStop.id}`,
        stop: destinationStop,
        type: 'destination' as const,
        isPickup: false,
        isDropoff: true,
        time: trip.arrivalTime,
      },
    ]
  }, [trip, originStop, destinationStop, intermediateStops])

  const pickupPoints = useMemo(() => {
    if (!originStop) return []
    const points: Stop[] = [originStop]
    for (const rs of intermediateStops) {
      if (rs.isPickup) points.push(rs.stop)
    }
    return points
  }, [originStop, intermediateStops])

  const dropoffPoints = useMemo(() => {
    if (!destinationStop) return []
    const points: Stop[] = []
    for (const rs of intermediateStops) {
      if (rs.isDropoff) points.push(rs.stop)
    }
    points.push(destinationStop)
    return points
  }, [destinationStop, intermediateStops])

  const mapPoints = useMemo(() => {
    const pts = allStops
      .map((s) => {
        const lat = s.stop.latitude
        const lng = s.stop.longitude
        if (typeof lat !== 'number' || typeof lng !== 'number') return null
        return { id: s.id, name: s.stop.name, type: s.type, lat, lng }
      })
      .filter(Boolean) as Array<{ id: string; name: string; type: 'origin' | 'destination' | 'intermediate'; lat: number; lng: number }>
    return pts
  }, [allStops])

  const polyline = useMemo(() => mapPoints.map((p) => [p.lat, p.lng] as [number, number]), [mapPoints])

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (polyline.length < 1) return null
    return polyline as unknown as LatLngBoundsExpression
  }, [polyline])

  const baseFare = Number(trip?.basePrice || 0)
  const serviceFee = 0
  const total = baseFare * passengers + serviceFee

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trip not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {trip.route.originStop.name} <span className="text-gray-400 dark:text-gray-600">→</span> {trip.route.destinationStop.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(trip.departureTime)}
                <span className="mx-1">•</span>
                <Clock className="w-4 h-4" />
                {formatTime(trip.departureTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Bus Images Gallery */}
            {trip.bus && trip.bus.images && trip.bus.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    Bus Photos
                  </CardTitle>
                  <CardDescription>
                    {trip.bus.images.length} photo{trip.bus.images.length !== 1 ? 's' : ''} of this bus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Main Image Slider */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
                      <Image
                        src={trip.bus.images[currentImageIndex]}
                        alt={`Bus ${trip.bus.plateNumber || trip.bus.model} - Photo ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 66vw"
                        priority
                      />

                      {/* Navigation Arrows */}
                      {trip.bus.images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-lg backdrop-blur-sm"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-lg backdrop-blur-sm"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                        {currentImageIndex + 1} / {trip.bus.images.length}
                      </div>
                    </div>

                    {/* Thumbnail Navigation */}
                    {trip.bus.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {trip.bus.images.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex
                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                            }`}
                          >
                            <Image src={imageUrl} alt={`Thumbnail ${index + 1}`} fill className="object-cover" sizes="80px" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Route Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-blue-600" />
                  Route Map
                </CardTitle>
                <CardDescription>
                  Pickup and dropoff points are shown on the map using OpenStreetMap.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bounds ? (
                  <div className="h-[360px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                    <MapContainer
                      center={polyline[0] || [10.7758, 106.7009]}
                      zoom={11}
                      scrollWheelZoom
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <FitBounds bounds={bounds} />

                      {polyline.length >= 2 && <Polyline positions={polyline} />}

                      {mapPoints.map((p) => (
                        <CircleMarker
                          key={p.id}
                          center={[p.lat, p.lng]}
                          radius={p.type === 'origin' || p.type === 'destination' ? 8 : 6}
                          pathOptions={{}}
                        >
                          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                            <div className="text-xs">
                              <div className="font-semibold">{p.name}</div>
                              <div>
                                {p.type === 'origin' ? 'Pickup (Origin)' : p.type === 'destination' ? 'Dropoff (Destination)' : 'Stop'}
                              </div>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-400">
                    Map is unavailable because stop coordinates are missing.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Route Details
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{trip.route.originStop.name}</span>
                  <span className="text-gray-400 dark:text-gray-600">→</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{trip.route.destinationStop.name}</span>
                  {trip.route.name ? (
                    <>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        {trip.route.name}
                      </span>
                    </>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Distance</div>
                      <div className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                        {trip.route.distanceKm ? `${trip.route.distanceKm} km` : 'N/A'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                      <div className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                        {trip.route.estimatedMinutes
                          ? `${Math.floor(trip.route.estimatedMinutes / 60)}h ${trip.route.estimatedMinutes % 60}m`
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Depart</div>
                      <div className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{formatTime(trip.departureTime)}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Arrive</div>
                      <div className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{formatTime(trip.arrivalTime)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Badge variant="default">{allStops.length} stop{allStops.length === 1 ? '' : 's'}</Badge>
                    <Badge variant="info">Pickup points: {pickupPoints.length}</Badge>
                    <Badge variant="success">Dropoff points: {dropoffPoints.length}</Badge>
                  </div>

                  {allStops.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-400">
                      Route stops are unavailable.
                    </div>
                  ) : (
                    <div className="relative pl-8 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-800">
                      {allStops.map((s, idx) => (
                        <div key={s.id} className="relative">
                          <div className="absolute -left-[29px] w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-gray-950">
                            <div
                              className={
                                s.type === 'origin'
                                  ? 'w-2 h-2 rounded-full bg-blue-600'
                                  : s.type === 'destination'
                                    ? 'w-2 h-2 rounded-full bg-green-600'
                                    : 'w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700'
                              }
                            />
                          </div>

                          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 w-6 text-right">
                                    {idx + 1}.
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{s.stop.name}</h4>
                                    {s.stop.address ? (
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{s.stop.address}</p>
                                    ) : null}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {s.type === 'origin' && <Badge variant="info">Pickup</Badge>}
                                      {s.type === 'destination' && <Badge variant="success">Dropoff</Badge>}
                                      {s.type === 'intermediate' && s.isPickup && <Badge variant="info">Pickup</Badge>}
                                      {s.type === 'intermediate' && s.isDropoff && <Badge variant="success">Dropoff</Badge>}
                                      {s.type === 'intermediate' && !s.isPickup && !s.isDropoff && <Badge variant="default">Stop</Badge>}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {s.time ? (
                                <div className="text-left sm:text-right shrink-0">
                                  <div className="font-semibold text-gray-900 dark:text-gray-100">{formatTime(s.time)}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(s.time)}</div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bus Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-blue-600" />
                  Bus Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Operator</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{trip.bus?.operator?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bus Model</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{trip.bus?.model || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plate Number</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{trip.bus?.plateNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Seat Capacity</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{trip.bus?.seatCapacity ? `${trip.bus.seatCapacity} seats` : 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Amenities</h4>
                  <AmenityBadges amenities={trip.bus?.amenities || undefined} />
                </div>
              </CardContent>
            </Card>

            {/* Boarding / Dropping Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  Boarding & Dropping Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="info">Pickup</Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Boarding points</span>
                    </div>
                    <div className="space-y-3">
                      {pickupPoints.map((p) => (
                        <div key={p.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                          {p.address ? <div className="text-sm text-gray-500 dark:text-gray-400">{p.address}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="success">Dropoff</Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dropping points</span>
                    </div>
                    <div className="space-y-3">
                      {dropoffPoints.map((p) => (
                        <div key={p.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                          {p.address ? <div className="text-sm text-gray-500 dark:text-gray-400">{p.address}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cancellation & Refund Policy</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Cancel 24h before departure: 100% refund</li>
                    <li>Cancel 12h before departure: 50% refund</li>
                    <li>Cancel less than 12h before departure: No refund</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Boarding Policy</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Please arrive at the boarding point 15 minutes before departure.</li>
                    <li>Present your e-ticket and valid ID proof while boarding.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">4.8</div>
                  <div>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mock reviews (demo)</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback className="text-xs font-semibold">{review.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{review.user}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Pricing</CardTitle>
                  <CardDescription>
                    {passengers} passenger{passengers > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">Base fare</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(baseFare)} × {passengers}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full h-12 text-lg" onClick={() => router.push(`/booking/seats/${trip.id}?passengers=${passengers}`)}>
                        Book Now
                      </Button>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                        By clicking Book Now, you agree to our Terms & Conditions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Need Help?</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Call our customer support at <br/>
                        <span className="font-semibold text-blue-600">1900 1234</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Alternative Trips */}
        {alternativeTrips.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Alternative Trips
            </h2>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You might also be interested in these trips on the same route.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6">
              {alternativeTrips.map((altTrip) => (
                <TripCard 
                  key={altTrip.id} 
                  trip={altTrip} 
                  passengers={passengers}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
