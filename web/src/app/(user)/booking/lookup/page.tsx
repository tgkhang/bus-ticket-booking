'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getBookingPublicByReferenceAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function GuestBookingLookupPage() {
  const router = useRouter()
  const [referenceCode, setReferenceCode] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [booking, setBooking] = useState<any>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setBooking(null)

    try {
      const trimmedReferenceCode = referenceCode.trim()
      const trimmedToken = token.trim()

      const data = await getBookingPublicByReferenceAPI(trimmedReferenceCode, trimmedToken)

      if (data?.id && trimmedReferenceCode && trimmedToken) {
        sessionStorage.setItem(
          'guest_booking_access',
          JSON.stringify({
            bookingId: data.id,
            referenceCode: trimmedReferenceCode,
            token: trimmedToken,
          })
        )

        router.push(
          `/booking/confirmation?bookingId=${encodeURIComponent(data.id)}&bookingRef=${encodeURIComponent(
            trimmedReferenceCode
          )}`
        )
        return
      }

      setBooking(data)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to lookup booking'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guest Booking Lookup</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Enter your booking reference code and access token to view booking status.
        </p>

        <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference Code</label>
            <input
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="e.g. BK-1A2B3C4D5E6F"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Access Token</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your token"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Looking up…' : 'Lookup Booking'}
          </Button>
        </form>

        {booking && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">ID: {booking.id}</p>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Status: {booking.status}</div>
            </div>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-medium">Route:</span>{' '}
                {booking?.trip?.route?.originStop?.name} → {booking?.trip?.route?.destinationStop?.name}
              </div>
              <div>
                <span className="font-medium">Departure:</span>{' '}
                {booking?.trip?.departureTime ? new Date(booking.trip.departureTime).toLocaleString() : '—'}
              </div>
              <div>
                <span className="font-medium">Passengers:</span> {Array.isArray(booking?.passengerDetails) ? booking.passengerDetails.length : 0}
              </div>
              <div>
                <span className="font-medium">Total:</span> {booking?.totalAmount} VND
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
