import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { API_ROOT } from '@/lib/utils/constants'
import { Ticket, Calendar, MapPin, ArrowRight, AlertCircle, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LiveTripStatus from './LiveTripStatus'

export const dynamic = 'force-dynamic'

type StatusParam = 'all' | 'pending' | 'confirmed'  | 'completed' | 'cancelled'

const PAGE_SIZE = 5

async function buildCookieHeader() {
  const cookieStore = await cookies()
  return cookieStore
    .getAll()
    .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
    .join('; ')
}

async function cancelBookingAction(formData: FormData) {
  'use server'

  const bookingId = String(formData.get('bookingId') || '')
  const status = String(formData.get('status') || 'all')
  const page = String(formData.get('page') || '1')

  if (!bookingId) {
    redirect(`/booking?status=${encodeURIComponent(status)}&page=${encodeURIComponent(page)}`)
  }

  const cookieHeader = await buildCookieHeader()

  await fetch(`${API_ROOT}/v1/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: {
      cookie: cookieHeader,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  redirect(`/booking?status=${encodeURIComponent(status)}&page=${encodeURIComponent(page)}`)
}

function normalizeStatusParam(raw: unknown): StatusParam {
  const value = typeof raw === 'string' ? raw : ''
  if (value === 'confirmed' || value === 'pending' || value === 'completed' || value === 'cancelled') return value
  return 'all'
}

function normalizePage(raw: unknown): number {
  const value = typeof raw === 'string' ? parseInt(raw, 10) : NaN
  if (!Number.isFinite(value) || value < 1) return 1
  return value
}

function buildBookingsUrl(status: StatusParam, page: number) {
  const params = new URLSearchParams()
  params.set('status', status)
  params.set('page', String(page))
  return `/booking?${params.toString()}`
}

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

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = (await searchParams) || {}
  const statusParam = normalizeStatusParam(resolvedSearchParams.status)
  const page = normalizePage(resolvedSearchParams.page)
  const apiStatus = statusParam === 'all' ? undefined : statusParam

  const cookieHeader = await buildCookieHeader()

  const url = new URL(`${API_ROOT}/v1/bookings`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(PAGE_SIZE))
  if (apiStatus) url.searchParams.set('status', apiStatus)

  let bookings: any[] = []
  let meta: { page: number; limit: number; total: number; totalPages: number } | null = null
  let error: string | null = null

  try {
    const res = await fetch(url.toString(), {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })

    if (!res.ok) {
      error = `Failed to load your bookings (HTTP ${res.status})`
    } else {
      const json = await res.json()
      bookings = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
      meta = json?.meta || null
    }
  } catch (e) {
    console.error('Failed to fetch bookings:', e)
    error = 'Failed to load your bookings'
  }

  const totalPages = Math.max(1, meta?.totalPages || 1)
  const safePage = Math.min(Math.max(page, 1), totalPages)

  if (safePage !== page) {
    redirect(buildBookingsUrl(statusParam, safePage))
  }

  const TABS: Array<{ key: StatusParam; label: string }> = [
    { key: 'all', label: 'All Bookings' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

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

        {/* Tabs (always visible) */}
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

        {/* Booking List */}
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
                              <form action={cancelBookingAction}>
                                <input type="hidden" name="bookingId" value={booking.id} />
                                <input type="hidden" name="status" value={statusParam} />
                                <input type="hidden" name="page" value={safePage} />
                                <Button
                                  type="submit"
                                  variant="outline"
                                  className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full px-6 py-2.5 text-sm font-medium"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </form>
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