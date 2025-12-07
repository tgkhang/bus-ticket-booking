'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBookingByIdAPI } from '@/lib/api'
import { CheckCircle, Ticket, ArrowRight, Printer, Download, QrCode, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const bookingId = searchParams.get('bookingId')
  const bookingRef = searchParams.get('bookingRef')

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        toast.error('Invalid booking ID')
        setLoading(false)
        return
      }

      try {
        const response = await getBookingByIdAPI(bookingId)
        // Backend returns booking directly (not wrapped in { data: ... })
        setBooking(response)
      } catch (err) {
        console.error('Failed to fetch booking:', err)
        toast.error('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    toast.info('PDF download functionality will be implemented')
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

  if (!bookingRef || !booking) {
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
          <h2 className="text-3xl font-bold text-white tracking-wider">{bookingRef}</h2>
          <p className="text-blue-100 mt-4">
            A confirmation email has been sent to your email address
          </p>
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

            {/* QR Code Placeholder */}
            <div className="flex items-center justify-center mb-6 pb-6 border-b border-gray-200">
              <div className="bg-gray-100 w-48 h-48 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Scan at boarding</p>
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
          <Link href="/booking">
            <Button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
              View My Bookings
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
