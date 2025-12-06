'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserBookingsAPI } from '@/lib/api'
import { Ticket, Calendar, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getUserBookingsAPI()
        setBookings(response.data || [])
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError('Failed to load your bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">View and manage your bus ticket bookings</p>
          </div>
          <Button onClick={() => router.push('/homepage')} variant="outline">
            Book New Trip
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Bookings Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You haven't made any bookings yet. Start exploring bus trips now!
            </p>
            <Button onClick={() => router.push('/homepage')} className="bg-blue-600 hover:bg-blue-700">
              Book Your First Trip
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Ticket className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Booking Reference</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{booking.bookingReference}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Route</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 dark:text-white font-medium">
                            {booking.trip?.originStop?.name} → {booking.trip?.destinationStop?.name}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Departure</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 dark:text-white font-medium">
                            {new Date(booking.trip?.departureTime).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(Number(booking.totalAmount))}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => router.push(`/booking/confirmation?bookingId=${booking.id}&bookingRef=${booking.bookingReference}`)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
