'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Navigation, Clock, DollarSign, ArrowRight, Route as RouteIcon } from 'lucide-react'
import { getRouteDetailsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Route, Stop } from '@/types/routeAndStop'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DisplayRouteStop {
  id: string
  stopId: string
  stopName: string
  stopAddress: string
  sequence: number
  isPickup: boolean
  isDropoff: boolean
  distanceFromOrigin?: number
  estimatedMinutes?: number
  note?: string
  stop?: Stop
}

interface DisplayRoute extends Omit<Route, 'stops'> {
  basePrice?: number
  originStopName: string
  destinationStopName: string
  operatorName: string
  stops: DisplayRouteStop[]
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [map, bounds])
  return null
}

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string

  const [route, setRoute] = useState<DisplayRoute | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'stops'>('info')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        setLoading(true)
        const apiRoute = await getRouteDetailsAPI(routeId)

        // Transform API response to DisplayRoute
        const displayRoute: DisplayRoute = {
          ...apiRoute,
          basePrice: 0, // TODO: Add basePrice to API response if needed
          originStopName: apiRoute.originStop.name,
          destinationStopName: apiRoute.destinationStop.name,
          operatorName: apiRoute.operator.name,
          stops: apiRoute.stops.map((routeStop) => ({
            id: routeStop.id,
            stopId: routeStop.stopId,
            stopName: routeStop.stop.name,
            stopAddress: routeStop.stop.address,
            sequence: routeStop.sequence,
            isPickup: routeStop.isPickup,
            isDropoff: routeStop.isDropoff,
            distanceFromOrigin: 0, // TODO: Add to API response if needed
            estimatedMinutes: 0, // TODO: Add to API response if needed
            note: routeStop.note || undefined,
            stop: routeStop.stop, // Preserve the full stop object with coordinates
          })),
        }

        setRoute(displayRoute)
      } catch (error) {
        toast.error('Failed to fetch route details')
        console.error('Error fetching route details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRouteDetails()
  }, [routeId])

  // Map logic
  const allStops = useMemo(() => {
    if (!route) return []

    const stops = [
      {
        id: `origin-${route.originStopId}`,
        name: route.originStopName,
        type: 'origin' as const,
        latitude: route.originStop?.latitude,
        longitude: route.originStop?.longitude,
      },
      ...route.stops.map((stop) => ({
        id: stop.id,
        name: stop.stopName,
        type: 'intermediate' as const,
        latitude: stop.stop?.latitude,
        longitude: stop.stop?.longitude,
      })),
      {
        id: `destination-${route.destinationStopId}`,
        name: route.destinationStopName,
        type: 'destination' as const,
        latitude: route.destinationStop?.latitude,
        longitude: route.destinationStop?.longitude,
      },
    ]
    return stops
  }, [route])

  const mapPoints = useMemo(() => {
    const pts = allStops
      .map((s) => {
        const lat = s.latitude
        const lng = s.longitude
        if (typeof lat !== 'number' || typeof lng !== 'number') return null
        return { id: s.id, name: s.name, type: s.type, lat, lng }
      })
      .filter(Boolean) as Array<{
      id: string
      name: string
      type: 'origin' | 'destination' | 'intermediate'
      lat: number
      lng: number
    }>
    return pts
  }, [allStops])

  const polyline = useMemo(() => mapPoints.map((p) => [p.lat, p.lng] as [number, number]), [mapPoints])

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (polyline.length < 1) return null
    return polyline as unknown as LatLngBoundsExpression
  }, [polyline])

  if (loading || !route) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading route details...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/staff/routes')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{route.name}</h1>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>{route.originStopName}</span>
              </div>
              <ArrowRight className="w-4 h-4" />
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>{route.destinationStopName}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-white ${route.active ? 'bg-[#10B981]' : 'bg-gray-500'}`}>
            {route.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Distance</p>
                <p className="text-gray-900 dark:text-white text-2xl">{route.distanceKm} km</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Duration</p>
                <p className="text-gray-900 dark:text-white text-2xl">
                  {Math.floor(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}m
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Base Price</p>
                <p className="text-gray-900 dark:text-white text-2xl">₫{(route.basePrice || 0) / 1000}K</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Stops</p>
                <p className="text-gray-900 dark:text-white text-2xl">{route.stops.length + 2}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
          <Button
            onClick={() => setActiveTab('info')}
            className={
              activeTab === 'info'
                ? ''
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          >
            Route Information
          </Button>
          <Button
            onClick={() => setActiveTab('stops')}
            className={
              activeTab === 'stops'
                ? ''
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          >
            Route Stops
          </Button>
        </div>

        {/* Route Information Tab */}
        {activeTab === 'info' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Route Details</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Route Name</label>
                <p className="text-gray-900 dark:text-white py-3">{route.name}</p>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Operator</label>
                <p className="text-gray-900 dark:text-white py-3">{route.operatorName}</p>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Origin Stop</label>
                <p className="text-gray-900 dark:text-white py-3">{route.originStopName}</p>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Destination Stop</label>
                <p className="text-gray-900 dark:text-white py-3">{route.destinationStopName}</p>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Total Distance (km)</label>
                <p className="text-gray-900 dark:text-white py-3">{route.distanceKm} km</p>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Estimated Duration</label>
                <p className="text-gray-900 dark:text-white py-3">
                  {Math.floor(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}m
                </p>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Base Price (VND)</label>
                <p className="text-gray-900 dark:text-white py-3">₫{(route.basePrice || 0).toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Status</label>
                <p className="text-gray-900 dark:text-white py-3">{route.active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            {/* Route Visualization */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-blue-600" />
                Route Map
              </h3>
              {bounds ? (
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
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-400">
                  Map is unavailable because stop coordinates are missing.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stops Tab */}
        {activeTab === 'stops' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Route Stops</h2>

            {/* Journey Flow */}
            <div className="space-y-4">
              {/* Origin */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div className="flex-1 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Origin</h3>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">0 km • 0h 0m</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{route.originStopName}</p>
                </div>
              </div>

              {/* Intermediate Stops */}
              {route.stops.map((stop) => (
                <div key={stop.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{stop.sequence}</span>
                    </div>
                    <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{stop.stopName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stop.stopAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {stop.distanceFromOrigin || 0} km from origin
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.floor((stop.estimatedMinutes || 0) / 60)}h {(stop.estimatedMinutes || 0) % 60}m
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          stop.isPickup
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                        }`}
                      >
                        {stop.isPickup ? '✓ Pickup' : '✗ No Pickup'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          stop.isDropoff
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                        }`}
                      >
                        {stop.isDropoff ? '✓ Drop-off' : '✗ No Drop-off'}
                      </span>
                    </div>

                    {stop.note && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-300">
                        {stop.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Destination</h3>
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
                      {route.distanceKm} km • {Math.floor(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}m
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{route.destinationStopName}</p>
                </div>
              </div>
            </div>

            {route.stops.length === 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center mt-6">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No intermediate stops</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  This route goes directly from origin to destination
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
