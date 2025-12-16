'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserBookingsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Ticket, Calendar, MapPin, ArrowRight, Loader2, AlertCircle, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const TABS = [
    { key: 'all', label: 'All Bookings' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  const currentDate = new Date('2025-12-17T00:00:00')

  const filteredBookings = bookings.filter((b) => {
    const departureDate = new Date(b.trip?.departureTime || b.departureTime)
    switch (activeTab) {
      case 'upcoming':
        return (b.status === 'confirmed' || b.status === 'pending') && departureDate > currentDate
      case 'past':
        return b.status === 'completed'
      case 'cancelled':
        return b.status === 'cancelled'
      default:
        return true
    }
  })

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getUserBookingsAPI()
        setBookings(response.data?.data || response.data || [])
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError('Failed to load your bookings')
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'cancelled':
        return 'bg-red-500 text-white'
      case 'completed':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage your bus ticket bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
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
          <>
            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-8">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking List */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try selecting a different tab or book a new trip.
                </p>
                <Button onClick={() => router.push('/homepage')} className="bg-blue-600 hover:bg-blue-700">
                  Book New Trip
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => {
                  const isCancellable =
                    (booking.status === 'confirmed' || booking.status === 'pending') &&
                    new Date(booking.trip?.departureTime || booking.departureTime) > currentDate

                  return (
                    <div
                      key={booking.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Header: Ref + Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <Ticket className="w-6 h-6 text-blue-600 shrink-0" />
                            <span className="font-semibold text-lg text-gray-900 dark:text-white">
                              {booking.bookingReference || booking.bookingRef || booking.id}
                            </span>
                            <Badge className={`${getStatusBadge(booking.status)} px-3 py-1 rounded-full text-sm font-medium capitalize`}>
                              {booking.status ? booking.status : ''}
                            </Badge>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium mb-1">Route</p>
                            <p className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                              {booking.trip?.route?.originStop?.name || booking.trip?.originStop?.name || booking.origin || '—'}
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              {booking.trip?.route?.destinationStop?.name || booking.trip?.destinationStop?.name || booking.destination || '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 font-medium mb-1">Date & Time</p>
                            <p className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                              {(() => {
                                const dt = booking.trip?.departureTime || booking.departureTime;
                                if (!dt) return '—';
                                const date = new Date(dt);
                                return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} | ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}`;
                              })()}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 font-medium mb-1">Operator</p>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {booking.trip?.bus?.operator?.name || booking.trip?.operator?.name || booking.operatorName || '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 font-medium mb-1 flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> Passengers</p>
                            <p className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
                              <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 15.75a7.5 7.5 0 017.5 4.368" /></svg></span>
                              {(booking.passengerDetails?.length || booking.passengers?.length || booking.seats?.length || booking.numPassengers || 1)}
                              {booking.passengerDetails && booking.passengerDetails.length > 0 && (
                                <> | Seats: {booking.passengerDetails.map((p: any) => p.seatCode || p.seatNumber || p.seat || p).join(', ')}</>
                              )}
                              {!booking.passengerDetails && booking.seats && booking.seats.length > 0 && (
                                <> | Seats: {booking.seats.map((s: any) => s.seatNumber || s.seatCode || s).join(', ')}</>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Total & Actions Row */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            Total:
                            <span className="text-2xl font-bold text-blue-600 ml-2">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(booking.totalAmount))}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() =>
                                router.push(`/booking/confirmation?bookingId=${booking.id}&bookingRef=${booking.bookingReference}`)
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 text-sm font-medium"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Ticket
                            </Button>
                            {isCancellable && (
                              <Button
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full px-6 py-2.5 text-sm font-medium"
                                onClick={async () => {
                                  try {
                                    await import('@/lib/api').then(api => api.cancelBookingAPI(booking.id))
                                    toast.success('Booking cancelled successfully')
                                    setLoading(true)
                                    const response = await getUserBookingsAPI()
                                    setBookings(response.data?.data || response.data || [])
                                    setLoading(false)
                                  } catch (err) {
                                    toast.error('Failed to cancel booking')
                                  }
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}