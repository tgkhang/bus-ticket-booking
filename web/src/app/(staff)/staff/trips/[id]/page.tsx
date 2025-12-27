'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bus,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  User,
  AlertCircle,
  PlayCircle,
  Calendar,
  ArrowRight,
  Search,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTripPassengers, markPassengerBoarded, updateTripStatus } from '@/lib/api/staff'
import { toast } from 'sonner'

interface Passenger {
  id: string
  fullName: string
  email: string
  phone: string
  seatNumber: string
  bookingRef: string
  isBoarded: boolean
  boardedAt?: string
}

interface Trip {
  id: string
  route: {
    name: string
    originStop: { name: string }
    destinationStop: { name: string }
  }
  bus: {
    plateNumber: string
    model: string
  }
  departureTime: string
  arrivalTime: string
  status: 'scheduled' | 'departed' | 'arrived' | 'completed' | 'cancelled'
  actualDeparture?: string
  actualArrival?: string
  bookings: Array<{
    passengerDetails: Passenger[]
  }>
}

export default function StaffTripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('passengers')

  useEffect(() => {
    fetchTripData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const fetchTripData = async () => {
    try {
      setLoading(true)
      const data = await getTripPassengers(tripId)
      setTrip(data)
    } catch (error) {
      console.error('Error fetching trip data:', error)
      toast.error('Failed to load trip details')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (passengerId: string) => {
    try {
      await markPassengerBoarded(passengerId)
      toast.success('Passenger checked in successfully')
      // Refresh data
      await fetchTripData()
    } catch (error) {
      console.error('Error checking in passenger:', error)
      toast.error('Failed to check in passenger')
    }
  }

  const handleUpdateStatus = async (newStatus: 'scheduled' | 'departed' | 'arrived' | 'completed' | 'cancelled') => {
    try {
      await updateTripStatus(tripId, newStatus)
      toast.success(`Trip status updated to ${newStatus}`)
      // Refresh data
      await fetchTripData()
    } catch (error) {
      console.error('Error updating trip status:', error)
      toast.error('Failed to update trip status')
    }
  }

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

  // Get all passengers from bookings
  const allPassengers = trip.bookings.flatMap((booking) =>
    booking.passengerDetails.map((p) => ({ ...p, bookingRef: booking.passengerDetails[0]?.bookingRef || 'N/A' }))
  )

  const checkedInCount = allPassengers.filter((p) => p.isBoarded).length
  const filteredPassengers = allPassengers.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: 'default' as const, icon: Clock, label: 'Scheduled' },
      departed: { variant: 'warning' as const, icon: PlayCircle, label: 'Departed' },
      arrived: { variant: 'info' as const, icon: CheckCircle, label: 'Arrived' },
      completed: { variant: 'success' as const, icon: CheckCircle, label: 'Completed' },
      cancelled: { variant: 'error' as const, icon: XCircle, label: 'Cancelled' },
    }
    const config = variants[status as keyof typeof variants] || variants.scheduled
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/staff')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Trip Management</h1>
            <p className="text-gray-600 dark:text-gray-400">{trip.route.name}</p>
          </div>
        </div>
        {getStatusBadge(trip.status)}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{allPassengers.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Passengers</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{checkedInCount}</div>
            <div className="text-gray-600 dark:text-gray-400">Checked In</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {allPassengers.length - checkedInCount}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="passengers">Passenger List</TabsTrigger>
          <TabsTrigger value="details">Trip Details</TabsTrigger>
        </TabsList>

        {/* Passengers Tab */}
        <TabsContent value="passengers">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Passenger List</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {checkedInCount}/{allPassengers.length} checked in
                </div>
              </div>

              {/* Search */}
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, seat, or booking reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Progress Bar */}
              {allPassengers.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Check-in Progress</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {Math.round((checkedInCount / allPassengers.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(checkedInCount / allPassengers.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Passenger Cards */}
              <div className="space-y-3">
                {filteredPassengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className={`p-4 border rounded-lg transition-all ${
                      passenger.isBoarded
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <span className="font-semibold text-gray-900 dark:text-white">{passenger.fullName}</span>
                          </div>
                          {passenger.isBoarded && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Checked In
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {passenger.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {passenger.phone}
                          </div>
                          <div>
                            Seat: <span className="font-medium text-gray-900 dark:text-white">{passenger.seatNumber}</span>
                          </div>
                        </div>
                        {passenger.isBoarded && passenger.boardedAt && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Checked in at: {new Date(passenger.boardedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {!passenger.isBoarded ? (
                          <Button onClick={() => handleCheckIn(passenger.id)} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Check In
                          </Button>
                        ) : (
                          <Button variant="outline" disabled className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Boarded
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPassengers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No passengers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trip Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Trip Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Route</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      {trip.route.originStop.name}
                      <ArrowRight className="w-4 h-4" />
                      {trip.route.destinationStop.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bus</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Bus className="w-4 h-4" />
                      {trip.bus.plateNumber} - {trip.bus.model}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Scheduled Departure</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="w-4 h-4" />
                      {new Date(trip.departureTime).toLocaleString()}
                    </div>
                  </div>

                  {trip.actualDeparture && (
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Actual Departure</label>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        {new Date(trip.actualDeparture).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Scheduled Arrival</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4" />
                      {new Date(trip.arrivalTime).toLocaleString()}
                    </div>
                  </div>

                  {trip.actualArrival && (
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Actual Arrival</label>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        {new Date(trip.actualArrival).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Update Trip Status</h2>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleUpdateStatus('scheduled')}
                    disabled={trip.status === 'scheduled'}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Mark as Scheduled
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('departed')}
                    disabled={trip.status === 'departed' || trip.status === 'arrived' || trip.status === 'completed'}
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Mark as Departed
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('arrived')}
                    disabled={trip.status === 'arrived' || trip.status === 'completed' || trip.status === 'scheduled'}
                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Arrived
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={trip.status === 'completed'}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={trip.status === 'cancelled'}
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Trip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
