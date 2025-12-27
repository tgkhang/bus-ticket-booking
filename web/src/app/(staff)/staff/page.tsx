'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bus,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getMyTrips } from '@/lib/api/staff'
import { toast } from 'sonner'

interface Trip {
  id: string
  route: {
    name: string
    originStop: { name: string }
    destinationStop: { name: string }
  }
  departureTime: string
  arrivalTime: string
  bus: {
    plateNumber: string
    seatCapacity: number
  }
  status: 'scheduled' | 'departed' | 'arrived' | 'completed' | 'cancelled'
  bookings: Array<{
    passengerDetails: Array<{
      isBoarded: boolean
    }>
  }>
}

export default function StaffDashboard() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true)
        const response = await getMyTrips()
        setTrips(response.data || [])
      } catch (error) {
        console.error('Error fetching trips:', error)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMessage = (error as any)?.response?.data?.message || 'Failed to load trips'
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        )
      case 'departed':
        return (
          <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Departed
          </Badge>
        )
      case 'arrived':
        return (
          <Badge variant="info" className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Arrived
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="default" className="bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="error">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  const getBookedSeats = (trip: Trip) => {
    return trip.bookings.reduce((sum, booking) => sum + booking.passengerDetails.length, 0)
  }

  const getCheckedInCount = (trip: Trip) => {
    return trip.bookings.reduce(
      (sum, booking) => sum + booking.passengerDetails.filter((p) => p.isBoarded).length,
      0
    )
  }

  const upcomingTrips = trips.filter((t) => t.status === 'scheduled' || t.status === 'departed')
  const completedTrips = trips.filter((t) => t.status === 'completed')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your assigned trips and passengers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTrips.length}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips.length}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingTrips.reduce((sum, t) => sum + getBookedSeats(t), 0)}
            </div>
            <p className="text-xs text-muted-foreground">In upcoming trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTrips.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No upcoming trips assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => {
                const bookedSeats = getBookedSeats(trip)
                const checkedInCount = getCheckedInCount(trip)

                return (
                  <Link
                    key={trip.id}
                    href={`/staff/trips/${trip.id}`}
                    className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {trip.route.name}
                          </h3>
                          {getStatusBadge(trip.status)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">
                            {trip.route.originStop.name} <ArrowRight className="w-4 h-4 inline mx-1" />{' '}
                            {trip.route.destinationStop.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Bus className="w-4 h-4" />
                          <span className="text-sm">{trip.bus.plateNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Departure</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Passengers</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {bookedSeats}/{trip.bus.seatCapacity} booked
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Checked In</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {checkedInCount}/{bookedSeats}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {checkedInCount === 0 && bookedSeats > 0 && (
                            <span className="text-sm text-yellow-600 dark:text-yellow-500">⚠️ Check-in not started</span>
                          )}
                          {checkedInCount > 0 && checkedInCount < bookedSeats && (
                            <span className="text-sm text-blue-600 dark:text-blue-400">✓ Check-in in progress</span>
                          )}
                          {checkedInCount === bookedSeats && bookedSeats > 0 && (
                            <span className="text-sm text-green-600 dark:text-green-500">✓ All passengers checked in</span>
                          )}
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-sm font-medium">
                          Manage Trip →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Trips */}
      {completedTrips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTrips.map((trip) => {
                const bookedSeats = getBookedSeats(trip)
                const checkedInCount = getCheckedInCount(trip)

                return (
                  <div
                    key={trip.id}
                    className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{trip.route.name}</h3>
                          {getStatusBadge(trip.status)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">
                            {trip.route.originStop.name} <ArrowRight className="w-4 h-4 inline mx-1" />{' '}
                            {trip.route.destinationStop.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{trip.bus.plateNumber}</span>
                          <span>•</span>
                          <span>
                            {checkedInCount}/{bookedSeats} passengers
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Departed</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
