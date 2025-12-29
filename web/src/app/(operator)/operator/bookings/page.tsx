/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  cancelAdminBooking,
  confirmAdminBooking,
  getAdminBookingById,
  listAdminBookings,
} from '@/lib/api/adminBooking'
import { useAuth } from '@/hooks/useAuth'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | string

type AdminBookingRow = {
  id: string
  status: BookingStatus
  bookedAt?: string
  totalAmount?: number | string
  user?: {
    id: string
    email?: string
    username?: string
    displayName?: string
  }
  trip?: {
    id: string
    departureTime?: string
    arrivalTime?: string
    route?: {
      name?: string
      originStop?: { name?: string }
      destinationStop?: { name?: string }
    }
    bus?: {
      operator?: { name?: string }
    }
  }
  _count?: {
    passengerDetails?: number
    payments?: number
  }
}

type AdminBookingDetails = AdminBookingRow & {
  passengerDetails?: Array<{ id: string; fullName: string; documentId: string; seatCode: string }>
  payments?: Array<{
    id: string
    provider?: string
    transactionRef?: string
    amount?: number | string
    status?: string
    processedAt?: string
    createdAt?: string
  }>
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null

  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'bigint') return Number(value)

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : null
  }

  if (typeof value === 'object' && typeof (value as any).toString === 'function') {
    const n = Number(String((value as any).toString()))
    return Number.isFinite(n) ? n : null
  }

  return null
}

function formatMoney(amount?: unknown) {
  const n = coerceNumber(amount)
  if (n === null) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n)
}

function shortId(id: string) {
  if (!id) return '—'
  if (id.length <= 5) return id
  return `${id.slice(0, 5)}...`
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending')
    return (
      <span className="inline-flex items-center px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
        Pending
      </span>
    )
  if (s === 'confirmed')
    return (
      <span className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
        Confirmed
      </span>
    )
  if (s === 'cancelled')
    return (
      <span className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
        Cancelled
      </span>
    )
  if (s === 'completed')
    return (
      <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
        Completed
      </span>
    )
  return (
    <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
      {status || 'Unknown'}
    </span>
  )
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 10

export default function BookingsPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [bookings, setBookings] = useState<AdminBookingRow[]>([])
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<AdminBookingDetails | null>(null)

  // Get operator ID from current user
  const operatorId = user?.operatorId

  useEffect(() => {
    setPage(1)
  }, [status, from, to])

  const queryParams = useMemo(
    () => ({
      operatorId,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [operatorId, status, from, to, page]
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await listAdminBookings(queryParams)
        setBookings(data?.data || data?.bookings || [])
        setMeta(data?.meta || data?.pagination || null)
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [queryParams])

  const totalPages = meta?.totalPages || 1
  const total = meta?.total ?? bookings.length
  const showFrom = meta ? (meta.page - 1) * meta.limit + 1 : (page - 1) * PAGE_SIZE + 1
  const showTo = meta ? Math.min(meta.page * meta.limit, meta.total) : (page - 1) * PAGE_SIZE + bookings.length

  const openDetails = async (id: string) => {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetail(null)
    try {
      const data = await getAdminBookingById(id)
      setDetail(data)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load booking details')
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const refresh = async () => {
    try {
      const data = await listAdminBookings(queryParams)
      setBookings(data?.data || data?.bookings || [])
      setMeta(data?.meta || data?.pagination || null)
      if (detail?.id) {
        const d = await getAdminBookingById(detail.id)
        setDetail(d)
      }
    } catch {
      // ignore
    }
  }

  const canConfirm = (s: BookingStatus) => String(s).toLowerCase() === 'pending'
  const canCancel = (s: BookingStatus) => {
    const x = String(s).toLowerCase()
    return x === 'pending' || x === 'confirmed'
  }

  const confirmSelected = async () => {
    if (!detail?.id) return
    try {
      await confirmAdminBooking(detail.id)
      toast.success('Booking confirmed')
      await refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to confirm booking')
    }
  }

  const cancelSelected = async () => {
    if (!detail?.id) return
    try {
      await cancelAdminBooking(detail.id)
      toast.success('Booking cancelled')
      await refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel booking')
    }
  }

  const rows = useMemo(() => bookings || [], [bookings])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Management</h1>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatus('')
                  setFrom('')
                  setTo('')
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading bookings...</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">No bookings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1600px] table-fixed">
                <colgroup>
                  <col className="w-36" />
                  <col className="w-60" />
                  <col className="w-140" />
                  <col className="w-56" />
                  <col className="w-36" />
                  <col className="w-36" />
                  <col className="w-56" />
                  <col className="w-36" />
                </colgroup>
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Booking</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Trip</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Operator</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Booked At</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {rows.map((b) => {
                    const origin = b.trip?.route?.originStop?.name
                    const dest = b.trip?.route?.destinationStop?.name
                    const routeText = origin && dest ? `${origin} → ${dest}` : b.trip?.route?.name || '—'
                    const userText = b.user?.displayName || b.user?.username || '—'
                    const emailText = b.user?.email || '—'
                    const operatorName = b.trip?.bus?.operator?.name || '—'
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white" title={b.id}>
                              {shortId(b.id)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{userText}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{emailText}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{routeText}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          <p className="text-sm text-gray-900 dark:text-white">{operatorName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">{formatMoney(b.totalAmount)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {formatDateTime(b.bookedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button size="sm" variant="outline" onClick={() => openDetails(b.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rows.length === 0 ? 'Showing 0 results' : `Showing ${showFrom} to ${showTo} of ${total} bookings`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setDetail(null)
        }}
      >
        <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">Loading details...</div>
          ) : !detail ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">No details</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                  <p className="font-medium text-gray-900 dark:text-white break-all">{detail.id}</p>
                </div>
                <StatusBadge status={detail.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">User</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Name: {detail.user?.displayName || detail.user?.username || '—'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Email: {detail.user?.email || '—'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">User ID: {detail.user?.id || '—'}</p>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Trip</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Route:{' '}
                    {detail.trip?.route?.originStop?.name && detail.trip?.route?.destinationStop?.name
                      ? `${detail.trip.route.originStop.name} → ${detail.trip.route.destinationStop.name}`
                      : detail.trip?.route?.name || '—'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Operator: {detail.trip?.bus?.operator?.name || '—'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Departure: {formatDateTime(detail.trip?.departureTime)}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Arrival: {formatDateTime(detail.trip?.arrivalTime)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Summary</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Total: {formatMoney(detail.totalAmount)}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Booked At: {formatDateTime(detail.bookedAt)}</p>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Passengers</p>
                {!detail.passengerDetails || detail.passengerDetails.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No passenger details</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Document</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Seat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {detail.passengerDetails.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{p.fullName}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.documentId}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.seatCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Payments</p>
                {!detail.payments || detail.payments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No payments</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Provider</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Transaction</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Processed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {detail.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{p.provider || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 break-all">{p.transactionRef || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatMoney(p.amount)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.status || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(p.processedAt || p.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelSelected}
                  disabled={!canCancel(detail.status)}
                >
                  Cancel booking
                </Button>
                <Button type="button" onClick={confirmSelected} disabled={!canConfirm(detail.status)}>
                  Confirm booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
