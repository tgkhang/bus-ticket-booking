'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  ArrowRight,
  Map,
  Calendar,
  Bus,
  TrendingUp,
  Users,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

interface Stop {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  active: boolean
}

interface RouteStop {
  id: string
  stopId: string
  stopName: string
  stopAddress: string
  sequence: number
  isPickup: boolean
  isDropoff: boolean
  distanceFromOrigin?: number // in km
  estimatedMinutes?: number // from origin
  note?: string
}

interface Trip {
  id: string
  departureTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  seatsBooked: number
  totalSeats: number
}

interface Route {
  id: string
  name: string
  operatorId: string
  operatorName: string
  originStopId: string
  originStopName: string
  destinationStopId: string
  destinationStopName: string
  distanceKm: number
  estimatedMinutes: number
  basePrice?: number
  active: boolean
  stops: RouteStop[]
  trips: Trip[]
}

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string

  const [route, setRoute] = useState<Route | null>(null)
  const [isEditingRoute, setIsEditingRoute] = useState(false)
  const [showAddStopModal, setShowAddStopModal] = useState(false)
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'stops' | 'trips'>('info')

  const [availableStops, setAvailableStops] = useState<Stop[]>([
    {
      id: 's1',
      name: 'Ho Chi Minh City Terminal',
      latitude: 10.7769,
      longitude: 106.7009,
      address: '395 Điện Biên Phủ, Ward 4, District 3, HCMC',
      active: true,
    },
    {
      id: 's2',
      name: 'Da Lat Bus Station',
      latitude: 11.9404,
      longitude: 108.4583,
      address: 'Tô Hiến Thành, Phường 3, Da Lat',
      active: true,
    },
    {
      id: 's3',
      name: 'Bao Loc Rest Stop',
      latitude: 11.5483,
      longitude: 107.8083,
      address: 'National Highway 20, Bao Loc',
      active: true,
    },
    {
      id: 's4',
      name: 'Di Linh Stop',
      latitude: 11.5758,
      longitude: 108.0942,
      address: 'Di Linh Town, Lam Dong',
      active: true,
    },
  ])

  const [operators] = useState([
    { id: '1', name: 'National Express Vietnam' },
    { id: '2', name: 'Futa Bus Lines' },
    { id: '3', name: 'Mai Linh Express' },
  ])

  const [routeFormData, setRouteFormData] = useState({
    name: '',
    operatorId: '',
    originStopId: '',
    destinationStopId: '',
    distanceKm: 0,
    estimatedMinutes: 0,
    basePrice: 0,
    active: true,
  })

  const [stopFormData, setStopFormData] = useState({
    stopId: '',
    isPickup: true,
    isDropoff: true,
    distanceFromOrigin: 0,
    estimatedMinutes: 0,
    note: '',
  })

  // Mock data - Replace with API call
  useEffect(() => {
    const mockRoute: Route = {
      id: routeId || '1',
      name: 'HCMC - Da Lat Express',
      operatorId: '1',
      operatorName: 'National Express Vietnam',
      originStopId: 's1',
      originStopName: 'Ho Chi Minh City Terminal',
      destinationStopId: 's2',
      destinationStopName: 'Da Lat Bus Station',
      distanceKm: 308,
      estimatedMinutes: 390,
      basePrice: 350000,
      active: true,
      stops: [
        {
          id: 'rs1',
          stopId: 's3',
          stopName: 'Bao Loc Rest Stop',
          stopAddress: 'National Highway 20, Bao Loc',
          sequence: 1,
          isPickup: false,
          isDropoff: false,
          distanceFromOrigin: 154,
          estimatedMinutes: 195,
          note: 'Rest stop - 15 min break',
        },
        {
          id: 'rs2',
          stopId: 's4',
          stopName: 'Di Linh Stop',
          stopAddress: 'Di Linh Town, Lam Dong',
          sequence: 2,
          isPickup: true,
          isDropoff: true,
          distanceFromOrigin: 220,
          estimatedMinutes: 280,
        },
      ],
      trips: [
        {
          id: 't1',
          departureTime: '2024-12-15T08:00:00',
          status: 'scheduled',
          seatsBooked: 33,
          totalSeats: 45,
        },
        {
          id: 't2',
          departureTime: '2024-12-15T14:00:00',
          status: 'scheduled',
          seatsBooked: 12,
          totalSeats: 45,
        },
        {
          id: 't3',
          departureTime: '2024-12-16T08:00:00',
          status: 'scheduled',
          seatsBooked: 28,
          totalSeats: 45,
        },
      ],
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoute(mockRoute)
    setRouteFormData({
      name: mockRoute.name,
      operatorId: mockRoute.operatorId,
      originStopId: mockRoute.originStopId,
      destinationStopId: mockRoute.destinationStopId,
      distanceKm: mockRoute.distanceKm,
      estimatedMinutes: mockRoute.estimatedMinutes,
      basePrice: mockRoute.basePrice || 0,
      active: mockRoute.active,
    })
  }, [routeId])

  const handleSaveRouteDetails = () => {
    if (route) {
      const originStop = availableStops.find((s) => s.id === routeFormData.originStopId)
      const destStop = availableStops.find((s) => s.id === routeFormData.destinationStopId)
      const operator = operators.find((o) => o.id === routeFormData.operatorId)

      setRoute({
        ...route,
        ...routeFormData,
        originStopName: originStop?.name || '',
        destinationStopName: destStop?.name || '',
        operatorName: operator?.name || '',
      })
      setIsEditingRoute(false)
      // TODO: Call API to update route
    }
  }

  const handleOpenAddStopModal = (stop?: RouteStop) => {
    if (stop) {
      setEditingStop(stop)
      setStopFormData({
        stopId: stop.stopId,
        isPickup: stop.isPickup,
        isDropoff: stop.isDropoff,
        distanceFromOrigin: stop.distanceFromOrigin || 0,
        estimatedMinutes: stop.estimatedMinutes || 0,
        note: stop.note || '',
      })
    } else {
      setEditingStop(null)
      setStopFormData({
        stopId: '',
        isPickup: true,
        isDropoff: true,
        distanceFromOrigin: 0,
        estimatedMinutes: 0,
        note: '',
      })
    }
    setShowAddStopModal(true)
  }

  const handleSaveStop = () => {
    if (route) {
      const stop = availableStops.find((s) => s.id === stopFormData.stopId)
      if (!stop) return

      if (editingStop) {
        // Update existing stop
        setRoute({
          ...route,
          stops: route.stops.map((s) =>
            s.id === editingStop.id
              ? {
                  ...s,
                  ...stopFormData,
                  stopName: stop.name,
                  stopAddress: stop.address,
                }
              : s
          ),
        })
      } else {
        // Add new stop
        const newStop: RouteStop = {
          id: `rs_${Date.now()}`,
          ...stopFormData,
          stopName: stop.name,
          stopAddress: stop.address,
          sequence: route.stops.length + 1,
        }
        setRoute({ ...route, stops: [...route.stops, newStop] })
      }
      setShowAddStopModal(false)
      // TODO: Call API to add/update stop
    }
  }

  const handleDeleteStop = (stopId: string) => {
    if (window.confirm('Are you sure you want to delete this stop?')) {
      if (route) {
        const newStops = route.stops.filter((s) => s.id !== stopId)
        // Resequence
        const resequenced = newStops.map((stop, i) => ({ ...stop, sequence: i + 1 }))
        setRoute({ ...route, stops: resequenced })
        // TODO: Call API to delete stop
      }
    }
  }

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (!route) return

    const newStops = [...route.stops]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newStops.length) return // Swap
    ;[newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]]

    // Resequence
    const resequenced = newStops.map((stop, i) => ({ ...stop, sequence: i + 1 }))
    setRoute({ ...route, stops: resequenced })
    // TODO: Call API to reorder stops
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700'
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'completed':
        return 'bg-gray-100 text-gray-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (!route) {
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
            onClick={() => router.push('/admin/routes')}
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
            className={activeTab === 'info' ? '' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
          >
            Route Information
          </Button>
          <Button
            onClick={() => setActiveTab('stops')}
            className={activeTab === 'stops' ? '' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
          >
            Stops Management
          </Button>
          <Button
            onClick={() => setActiveTab('trips')}
            className={activeTab === 'trips' ? '' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
          >
            Scheduled Trips
          </Button>
        </div>

          {/* Route Information Tab */}
          {activeTab === 'info' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Route Details</h2>
                {!isEditingRoute ? (
                  <button
                    onClick={() => setIsEditingRoute(true)}
                    className="flex items-center gap-2 px-4 py-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveRouteDetails}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingRoute(false)
                        setRouteFormData({
                          name: route.name,
                          operatorId: route.operatorId,
                          originStopId: route.originStopId,
                          destinationStopId: route.destinationStopId,
                          distanceKm: route.distanceKm,
                          estimatedMinutes: route.estimatedMinutes,
                          basePrice: route.basePrice || 0,
                          active: route.active,
                        })
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Route Name</label>
                  {isEditingRoute ? (
                    <input
                      type="text"
                      value={routeFormData.name}
                      onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">{route.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Operator</label>
                  {isEditingRoute ? (
                    <select
                      value={routeFormData.operatorId}
                      onChange={(e) => setRouteFormData({ ...routeFormData, operatorId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    >
                      {operators.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-3">{route.operatorName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Origin Stop</label>
                  {isEditingRoute ? (
                    <select
                      value={routeFormData.originStopId}
                      onChange={(e) => setRouteFormData({ ...routeFormData, originStopId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    >
                      {availableStops.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-3">{route.originStopName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Destination Stop</label>
                  {isEditingRoute ? (
                    <select
                      value={routeFormData.destinationStopId}
                      onChange={(e) => setRouteFormData({ ...routeFormData, destinationStopId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    >
                      {availableStops.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-3">{route.destinationStopName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Total Distance (km)</label>
                  {isEditingRoute ? (
                    <input
                      type="number"
                      value={routeFormData.distanceKm}
                      onChange={(e) =>
                        setRouteFormData({
                          ...routeFormData,
                          distanceKm: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      step="0.1"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">{route.distanceKm} km</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Estimated Duration (minutes)</label>
                  {isEditingRoute ? (
                    <input
                      type="number"
                      value={routeFormData.estimatedMinutes}
                      onChange={(e) =>
                        setRouteFormData({
                          ...routeFormData,
                          estimatedMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">
                      {Math.floor(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}m
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Base Price (VND)</label>
                  {isEditingRoute ? (
                    <input
                      type="number"
                      value={routeFormData.basePrice}
                      onChange={(e) =>
                        setRouteFormData({
                          ...routeFormData,
                          basePrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      step="1000"
                    />
                  ) : (
                    <p className="text-gray-900 py-3">₫{(route.basePrice || 0).toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  {isEditingRoute ? (
                    <select
                      value={routeFormData.active ? 'active' : 'inactive'}
                      onChange={(e) => setRouteFormData({ ...routeFormData, active: e.target.value === 'active' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-3">{route.active ? 'Active' : 'Inactive'}</p>
                  )}
                </div>
              </div>

              {/* Route Visualization */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-gray-900 mb-4">Route Visualization</h3>
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Interactive Map View</p>
                    <p className="text-sm text-gray-500">
                      Map integration showing route path and stops would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stops Management Tab */}
          {activeTab === 'stops' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Route Stops</h2>
                <button
                  onClick={() => handleOpenAddStopModal()}
                  className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Stop
                </button>
              </div>

              {/* Journey Flow */}
              <div className="space-y-4">
                {/* Origin */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="w-0.5 h-16 bg-gray-300"></div>
                  </div>
                  <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-900">Origin</h3>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">0 km • 0h 0m</span>
                    </div>
                    <p className="text-gray-700">{route.originStopName}</p>
                  </div>
                </div>

                {/* Intermediate Stops */}
                {route.stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600">{stop.sequence}</span>
                      </div>
                      <div className="w-0.5 h-16 bg-gray-300"></div>
                    </div>
                    <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{stop.stopName}</h3>
                          <p className="text-sm text-gray-600">{stop.stopAddress}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleMoveStop(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleMoveStop(index, 'down')}
                            disabled={index === route.stops.length - 1}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddStopModal(stop)}
                            className="p-1 text-[#2563EB] hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStop(stop.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Navigation className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{stop.distanceFromOrigin || 0} km from origin</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {Math.floor((stop.estimatedMinutes || 0) / 60)}h {(stop.estimatedMinutes || 0) % 60}m
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            stop.isPickup ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {stop.isPickup ? '✓ Pickup' : '✗ No Pickup'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            stop.isDropoff ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {stop.isDropoff ? '✓ Drop-off' : '✗ No Drop-off'}
                        </span>
                      </div>

                      {stop.note && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          {stop.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Destination */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-900">Destination</h3>
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
                        {route.distanceKm} km • {Math.floor(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}
                        m
                      </span>
                    </div>
                    <p className="text-gray-700">{route.destinationStopName}</p>
                  </div>
                </div>
              </div>

              {route.stops.length === 0 && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mt-6">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No intermediate stops added yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Add stops along the route for pickups, drop-offs, or rest breaks
                  </p>
                  <button onClick={() => handleOpenAddStopModal()} className="text-[#2563EB] hover:underline">
                    Add your first stop
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scheduled Trips</h2>
                <Button
                  onClick={() => router.push('/admin/trips')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  View All Trips
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Total Trips</p>
                      <p className="text-2xl text-blue-900">{route.trips.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700">Total Bookings</p>
                      <p className="text-2xl text-green-900">
                        {route.trips.reduce((acc, t) => acc + t.seatsBooked, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-700">Avg. Occupancy</p>
                      <p className="text-2xl text-purple-900">
                        {Math.round(
                          (route.trips.reduce((acc, t) => acc + t.seatsBooked, 0) /
                            route.trips.reduce((acc, t) => acc + t.totalSeats, 0)) *
                            100
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trips List */}
              <div className="space-y-3">
                {route.trips.map((trip) => {
                  const occupancyPercentage = (trip.seatsBooked / trip.totalSeats) * 100
                  return (
                    <div
                      key={trip.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Bus className="w-6 h-6 text-[#2563EB]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-gray-900">
                                {new Date(trip.departureTime).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                              <span className="text-gray-400">•</span>
                              <p className="text-gray-900">
                                {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(trip.status)}`}>
                                {trip.status}
                              </span>
                              <span className="text-sm text-gray-600">
                                {trip.seatsBooked}/{trip.totalSeats} seats booked
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Occupancy</span>
                              <span className="text-gray-900">{occupancyPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  occupancyPercentage >= 80
                                    ? 'bg-red-500'
                                    : occupancyPercentage >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${occupancyPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>

      {/* Add/Edit Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingStop ? 'Edit Stop' : 'Add Intermediate Stop'}</h2>
              <button
                onClick={() => setShowAddStopModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Select Stop <span className="text-red-500">*</span>
              </label>
              <select
                value={stopFormData.stopId}
                onChange={(e) => setStopFormData({ ...stopFormData, stopId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Choose a stop</option>
                {route && availableStops
                  .filter((s) => s.id !== route.originStopId && s.id !== route.destinationStopId)
                  .map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.name} - {stop.address}
                    </option>
                  ))}
              </select>
            </div>              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Distance from Origin (km)</label>
                  <input
                  type="number"
                    value={stopFormData.distanceFromOrigin}
                    onChange={(e) =>
                      setStopFormData({
                        ...stopFormData,
                        distanceFromOrigin: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Estimated Time from Origin (minutes)</label>
                  <input
                    type="number"
                    value={stopFormData.estimatedMinutes}
                    onChange={(e) =>
                      setStopFormData({
                        ...stopFormData,
                        estimatedMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={stopFormData.isPickup}
                    onChange={(e) => setStopFormData({ ...stopFormData, isPickup: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                  />
                  <div>
                    <p className="text-gray-900 dark:text-white">Allow Pickup</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Passengers can board here</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={stopFormData.isDropoff}
                    onChange={(e) => setStopFormData({ ...stopFormData, isDropoff: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                  />
                <div>
                    <p className="text-gray-900 dark:text-white">Allow Drop-off</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Passengers can alight here</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Note (Optional)</label>
                <textarea
                  value={stopFormData.note}
                onChange={(e) => setStopFormData({ ...stopFormData, note: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="e.g., Rest stop - 15 min break"
              />
            </div>
          </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                onClick={() => setShowAddStopModal(false)}
                variant="outline"
                className="px-6 py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStop}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
              >
                {editingStop ? 'Update Stop' : 'Add Stop'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}