'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Ticket, Calendar, MapPin, ArrowRight, AlertCircle, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'
import LiveTripStatus from './LiveTripStatus'

type StatusParam = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

const PAGE_SIZE = 5

function getStatusBadge(status: string) {
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

function buildBookingsUrl(status: StatusParam, page: number) {
  const params = new URLSearchParams()
  params.set('status', status)
  params.set('page', String(page))
  return `/booking?${params.toString()}`
}

export default function BookingsList() {
  const searchParams = useSearchParams()
  
  const statusParam = (searchParams.get('status') || 'all') as StatusParam
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  
  const [bookings, setBookings] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const TABS: Array<{ key: StatusParam; label: string }> = [
    { key: 'all', label: 'All Bookings' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const url = new URL(`${API_ROOT}/v1/bookings`)
        url.searchParams.set('page', String(pageParam))
        url.searchParams.set('limit', String(PAGE_SIZE))
        if (statusParam !== 'all') {
          url.searchParams.set('status', statusParam)
        }

        const res = await authorizedAxiosInstance.get(url.toString())
        
        const data = res.data?.data || res.data || []
        setBookings(Array.isArray(data) ? data : [])
        setMeta(res.data?.meta || null)
      } catch (err: any) {
        console.error('Failed to fetch bookings:', err)
        setError(`Failed to load your bookings${err.response?.status ? ` (HTTP ${err.response.status})` : ''}`)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [statusParam, pageParam])

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setCancelling(bookingId)
    try {
      await authorizedAxiosInstance.post(`${API_ROOT}/v1/bookings/${bookingId}/cancel`)
      // Refresh bookings
      const url = new URL(`${API_ROOT}/v1/bookings`)
      url.searchParams.set('page', String(pageParam))
      url.searchParams.set('limit', String(PAGE_SIZE))
      if (statusParam !== 'all') {
        url.searchParams.set('status', statusParam)
      }
      const res = await authorizedAxiosInstance.get(url.toString())
      const data = res.data?.data || res.data || []
      setBookings(Array.isArray(data) ? data : [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      console.error('Failed to cancel booking:', err)
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  const totalPages = Math.max(1, meta?.totalPages || 1)
  const safePage = Math.min(Math.max(pageParam, 1), totalPages)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage your bus ticket bookings</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading bookings...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage your bus ticket bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={buildBookingsUrl(tab.key, 1)}
                className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  statusParam === tab.key
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
            {statusParam === 'all' ? (
              <>
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Bookings Yet</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You haven't made any bookings yet. Start exploring bus trips now!
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/homepage">Book Your First Trip</Link>
                </Button>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try selecting a different status or book a new trip.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/homepage">Book New Trip</Link>
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isCancellable = booking.status === 'confirmed' || booking.status === 'pending'

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

                    {/* Trip Status (Live) */}
                    <div className="mb-6 flex items-center gap-3">
                      <p className="text-gray-500 font-medium text-sm">
                        Live trip Status:
                      </p>

                      <LiveTripStatus
                        tripId={booking.trip?.id}
                        initialStatus={booking.trip?.status || booking.tripStatus || null}
                      />
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
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 text-sm font-medium">
                          <Link
                            href={`/booking/confirmation?bookingId=${booking.id}&bookingRef=${encodeURIComponent(
                              booking.bookingReference || booking.bookingRef || booking.id
                            )}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Ticket
                          </Link>
                        </Button>

                        {booking.status === 'completed' && booking.trip?.id && (
                          <Button asChild variant="outline" className="rounded-full px-6 py-2.5 text-sm font-medium">
                            <Link href={`/trips/${booking.trip.id}?reviewBookingId=${booking.id}#reviews`}>
                              Review
                            </Link>
                          </Button>
                        )}
                        {isCancellable && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelling === booking.id}
                            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full px-6 py-2.5 text-sm font-medium"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {cancelling === booking.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, meta?.total || safePage * PAGE_SIZE)} of {meta?.total ?? '—'}
              </p>
              <div className="flex items-center gap-2">
                {safePage <= 1 ? (
                  <Button variant="outline" className="rounded-full" disabled>
                    Previous
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={buildBookingsUrl(statusParam, safePage - 1)}>Previous</Link>
                  </Button>
                )}

                <span className="text-sm text-gray-700 dark:text-gray-300">Page {safePage} / {totalPages}</span>

                {safePage >= totalPages ? (
                  <Button variant="outline" className="rounded-full" disabled>
                    Next
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={buildBookingsUrl(statusParam, safePage + 1)}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
