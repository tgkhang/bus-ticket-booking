'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBookingByIdAPI, getBookingPublicByReferenceAPI } from '@/lib/api'
import { downloadETicketAPI, sendETicketEmailAPI } from '@/lib/api/eTicket'
import QRCode from 'react-qr-code'
import { CheckCircle, Ticket, ArrowRight, Printer, Download, QrCode, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()

  const bookingId = searchParams.get('bookingId')
  const bookingRef = searchParams.get('bookingRef')

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [guestAccess, setGuestAccess] = useState<{ referenceCode: string; token: string } | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        toast.error('Invalid booking ID')
        setLoading(false)
        return
      }

      try {
        // Guest flow: if we have reference/token saved in sessionStorage, use the public lookup endpoint.
        try {
          const raw = sessionStorage.getItem('guest_booking_access')
          if (raw) {
            const parsed = JSON.parse(raw)
            const referenceCode = parsed?.referenceCode
            const token = parsed?.token
            const storedBookingId = parsed?.bookingId

            if (storedBookingId === bookingId && referenceCode && token) {
              setGuestAccess({ referenceCode, token })
              const publicBooking = await getBookingPublicByReferenceAPI(referenceCode, token)
              setBooking(publicBooking)
              return
            }
          }
        } catch {
          // ignore malformed sessionStorage
        }

        if (!isAuthenticated) {
          toast.error('Please sign in or lookup your booking using reference/token.')
          setBooking(null)
          return
        }

        const response = await getBookingByIdAPI(bookingId)
        setBooking(response)
      } catch (err) {
        console.error('Failed to fetch booking:', err)
        toast.error('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, isAuthenticated])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!bookingId) return
    try {
      if (guestAccess) {
        toast.error('PDF download is available for signed-in users. Please use your e-ticket email or sign in.')
        return
      }
      const blob = await downloadETicketAPI(bookingId)
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `e-ticket-${bookingId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">No booking found. Please make a booking first.</p>
            <Button onClick={() => router.push('/homepage')} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-xl">Your bus ticket has been successfully booked</p>
        </div>

        {/* Booking Reference */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8 text-center">
          <p className="text-blue-100 mb-2">Booking Reference Number</p>
          <h2 className="text-3xl font-bold text-white tracking-wider">
            {guestAccess?.referenceCode || bookingRef || booking.referenceCode || booking.bookingReference || booking.bookingRef || booking.id}
          </h2>

          {guestAccess ? (
            <div className="mt-4 text-left bg-white/10 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-3">
                Save these details to lookup your booking later.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-blue-100 text-xs mb-1">Reference Code</p>
                  <input
                    readOnly
                    value={guestAccess.referenceCode}
                    className="w-full rounded-md px-3 py-2 bg-white text-gray-900 text-sm"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </div>
                <div>
                  <p className="text-blue-100 text-xs mb-1">Access Token</p>
                  <input
                    readOnly
                    value={guestAccess.token}
                    className="w-full rounded-md px-3 py-2 bg-white text-gray-900 text-sm"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-blue-100 mt-4">A confirmation email has been sent to your email address</p>
          )}
        </div>

        {/* E-Ticket Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Ticket Header */}
          <div className="bg-blue-600 text-white p-6 flex items-center gap-3">
            <Ticket className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold text-white">E-Ticket</h3>
              <p className="text-blue-100">Keep this ticket for your journey</p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            {/* Route & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-gray-600 mb-2 text-sm">Route</p>
                <p className="text-gray-900 text-xl font-semibold">
                  {booking.trip?.route?.originStop?.name}{' '}
                  <ArrowRight className="inline w-5 h-5 mx-2" />
                  {booking.trip?.route?.destinationStop?.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2 text-sm">Travel Date</p>
                <p className="text-gray-900 text-xl font-semibold">
                  {new Date(booking.trip?.departureTime).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Departure & Arrival */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-gray-600 mb-2 text-sm">Departure</p>
                <p className="text-gray-900 text-xl font-semibold">
                  {new Date(booking.trip?.departureTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-gray-600">{booking.trip?.route?.originStop?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-2 text-sm">Arrival</p>
                <p className="text-gray-900 text-xl font-semibold">
                  {new Date(booking.trip?.arrivalTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-gray-600">{booking.trip?.route?.destinationStop?.address || 'N/A'}</p>
              </div>
            </div>

            {/* Bus Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-gray-600 mb-2 text-sm">Bus Operator</p>
                <p className="text-gray-900 font-medium">{booking.trip?.bus?.operator?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-2 text-sm">Bus Model</p>
                <p className="text-gray-900 font-medium">{booking.trip?.bus?.model || 'N/A'}</p>
              </div>
            </div>

            {/* Passengers */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-600 mb-3 text-sm">Passengers</p>
              <div className="space-y-2">
                {booking.passengerDetails?.map((passenger: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">{passenger.fullName}</p>
                      <p className="text-gray-600 text-sm">ID: {passenger.documentId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-semibold">Seat {passenger.seatCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center mb-6 pb-6 border-b border-gray-200">
              <div className="bg-gray-100 w-48 h-48 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {booking && (
                    <QRCode
                      value={`https://domain.com/admin/verify-ticket?bookingId=${booking.id}`}
                      size={160}
                    />
                  )}
                  <p className="text-gray-500 text-sm mt-2">Scan at boarding</p>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total Amount Paid</span>
                <span className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(Number(booking.totalAmount))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Ticket
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </Button>
          <Link href={guestAccess ? '/booking/lookup' : '/booking'}>
            <Button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
              {guestAccess ? 'Booking Lookup' : 'View My Bookings'}
            </Button>
          </Link>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Please arrive at the departure point at least 15 minutes before departure time
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Bring a valid ID that matches the passenger information provided</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Show this e-ticket or QR code to the driver when boarding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                For any changes or cancellations, please contact us at least 24 hours before
                departure
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
