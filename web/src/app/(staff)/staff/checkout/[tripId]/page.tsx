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
import { getTripDetailsAPI, updateTripAPI } from '@/lib/api/tripApi'
import { TripDetail, TripStatus, Passenger } from '@/types/trip'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

interface PassengerWithCheckIn extends Passenger {
  checkedIn: boolean
  checkedInAt?: string
}

export default function StaffTripCheckout() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string

  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [passengers, setPassengers] = useState<PassengerWithCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchTripDetails()
  }, [tripId])

  const fetchTripDetails = async () => {
    try {
      setLoading(true)
      const data = await getTripDetailsAPI(tripId)
      setTrip(data)

      // Transform passengers from trip data
      if (data.passengers) {
        const transformedPassengers: PassengerWithCheckIn[] = data.passengers.map((p) => ({
          ...p,
          checkedIn: false, // Default to false, can be enhanced with actual check-in status from backend
        }))
        setPassengers(transformedPassengers)
      }
    } catch (error) {
      console.error('Error fetching trip details:', error)
      toast.error('Failed to load trip details')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = (passengerId: string) => {
    setPassengers((prev) =>
      prev.map((p) =>
        p.id === passengerId ? { ...p, checkedIn: true, checkedInAt: new Date().toISOString() } : p
      )
    )
    toast.success('Passenger checked in')
  }

  const handleUndoCheckIn = (passengerId: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === passengerId ? { ...p, checkedIn: false, checkedInAt: undefined } : p))
    )
    toast.success('Check-in undone')
  }

  const handleUpdateStatus = async (newStatus: TripStatus) => {
    if (!trip) return

    const confirmed = window.confirm(`Are you sure you want to change trip status to "${newStatus}"?`)
    if (!confirmed) return

    try {
      setUpdatingStatus(true)
      await updateTripAPI(tripId, { status: newStatus })
      setTrip({ ...trip, status: newStatus })
      toast.success(`Trip status updated to "${newStatus}"`)
    } catch (error) {
      console.error('Error updating trip status:', error)
      toast.error('Failed to update trip status')
    } finally {
      setUpdatingStatus(false)
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

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
            <Clock className="w-4 h-4" />
            Scheduled
          </span>
        )
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md">
            <PlayCircle className="w-4 h-4" />
            Active
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-center">Trip not found</div>
      </div>
    )
  }

  const checkedInCount = passengers.filter((p) => p.checkedIn).length
  const filteredPassengers = passengers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/staff/trips')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trip Checkout</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{trip.route?.name || 'Trip Details'}</p>
          </div>
        </div>
        {getStatusBadge(trip.status)}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{passengers.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Passengers</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
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
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {passengers.length - checkedInCount}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Trip Information Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Route</div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {trip.route?.stops?.[0]?.stopName || trip.route?.name}
                    <ArrowRight className="w-4 h-4 inline mx-2" />
                    {trip.route?.stops?.[trip.route.stops.length - 1]?.stopName || trip.route?.destinationStopId}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bus className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bus</div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {trip.bus?.plateNumber} - {trip.bus?.model}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Departure</div>
                  <div className="text-gray-900 dark:text-white font-medium">{formatDateTime(trip.departureTime)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Arrival</div>
                  <div className="text-gray-900 dark:text-white font-medium">{formatDateTime(trip.arrivalTime)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white font-medium mb-4">Update Trip Status</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleUpdateStatus('scheduled')}
                disabled={trip.status === 'scheduled' || updatingStatus}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Scheduled
              </button>
              <button
                onClick={() => handleUpdateStatus('active')}
                disabled={trip.status === 'active' || updatingStatus}
                className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Trip
              </button>
              <button
                onClick={() => handleUpdateStatus('completed')}
                disabled={trip.status === 'completed' || updatingStatus}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={trip.status === 'cancelled' || updatingStatus}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Trip
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Passenger List</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {checkedInCount}/{passengers.length} checked in
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, seat, or booking reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Progress Bar */}
          {passengers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Check-in Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round((checkedInCount / passengers.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(checkedInCount / passengers.length) * 100}%` }}
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
                  passenger.checkedIn
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{passenger.name}</span>
                      </div>
                      {passenger.checkedIn && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Checked In
                        </span>
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
                        Seat: <span className="font-medium text-gray-900 dark:text-white">{passenger.seatNumber}</span>{' '}
                        | Ref: <span className="font-medium text-gray-900 dark:text-white">{passenger.bookingRef}</span>
                      </div>
                    </div>
                    {passenger.checkedIn && passenger.checkedInAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Checked in at:{' '}
                        {new Date(passenger.checkedInAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {!passenger.checkedIn ? (
                      <button
                        onClick={() => handleCheckIn(passenger.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Check In
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUndoCheckIn(passenger.id)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPassengers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {passengers.length === 0 ? 'No passengers for this trip' : 'No passengers found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
