/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBookingPublicAPI, getTripByIdAPI } from '@/lib/api'
import { confirmAndSendEmailPublicAPI } from '@/lib/api/eTicket'
import { createPaymentLinkAPI, createPaymentLinkPublicAPI } from '@/lib/api/payment'
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  Loader2,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dataParam = searchParams.get('data')
  const [bookingData, setBookingData] = useState<any>(null)
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  useEffect(() => {
    const initializeData = async () => {
      if (!dataParam) {
        toast.error('Invalid booking data')
        setLoading(false)
        return
      }

      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam))
        setBookingData(decoded)

        // Fetch trip details
        const tripData = await getTripByIdAPI(decoded.tripId)
        // Backend returns trip directly (not wrapped in { data: ... })
        setTrip(tripData)
      } catch (err) {
        console.error('Failed to initialize checkout:', err)
        toast.error('Failed to load booking data')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [dataParam])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error('Session expired. Please start over.')
          router.push('/homepage')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setIsProcessing(true)

    try {
      const seatIds = bookingData.seats.split(',')
      const bookingPayload = {
        tripId: bookingData.tripId,
        seatIds: seatIds,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        passengers: bookingData.passengers.map((p: any, index: number) => ({
          fullName: p.fullName,
          documentId: p.documentId,
          seatCode: p.seatCode || seatIds[index],
        })),
        totalAmount: Number(bookingData.totalPrice),
        contactInfo: bookingData.contactInfo,
      }

      // console.log('Creating booking with payload:', bookingPayload)

      // Create booking first (works for both logged-in users and guests)
      const bookingResult = await createBookingPublicAPI(bookingPayload)

      const booking = bookingResult?.booking ? bookingResult.booking : bookingResult
      const guestAccess = bookingResult?.guestAccess

      if (guestAccess?.referenceCode && guestAccess?.accessToken && booking?.id) {
        sessionStorage.setItem(
          'guest_booking_access',
          JSON.stringify({
            bookingId: booking.id,
            referenceCode: guestAccess.referenceCode,
            token: guestAccess.accessToken,
          })
        )
      }

      // Prepare payment items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentItems = bookingData.passengers.map((p: any, index: number) => ({
        name: `${trip.route?.originStop?.name} → ${trip.route?.destinationStop?.name} - ${p.fullName}`,
        quantity: 1,
        price: Math.floor(Number(bookingData.totalPrice) / bookingData.passengers.length),
      }))

      // Create PayOS payment link (description max 25 chars)
      const paymentData = {
        amount: Number(bookingData.totalPrice),
        description: 'Bus ticket booking',
        items: paymentItems,
        bookingId: booking.id, // UUID string
      }

      // console.log('Creating payment link with data:', paymentData)

      const paymentResponse = guestAccess?.referenceCode
        ? await createPaymentLinkPublicAPI({
            bookingId: booking.id,
            referenceCode: guestAccess.referenceCode,
            token: guestAccess.accessToken,
            description: paymentData.description,
            items: paymentData.items,
          })
        : await createPaymentLinkAPI(paymentData)

      // Redirect to PayOS checkout page
      if (paymentResponse.success && paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl
      } else {
        throw new Error('Failed to create payment link')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Payment failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed. Please try again.'
      toast.error(errorMessage)
      setIsProcessing(false)
    }
  }

  // Development only: Simulate successful payment without PayOS
  const handleDevPayment = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setIsProcessing(true)

    try {
      // Prepare booking payload
      const seatIds = bookingData.seats.split(',')
      const bookingPayload = {
        tripId: bookingData.tripId,
        seatIds: seatIds,
        passengers: bookingData.passengers.map((p: any, index: number) => ({
          fullName: p.fullName,
          documentId: p.documentId,
          seatCode: p.seatCode || seatIds[index],
        })),
        totalAmount: Number(bookingData.totalPrice),
        contactInfo: bookingData.contactInfo,
      }

      console.log('Creating booking with payload:', bookingPayload)

      // Create booking
      const bookingResult = await createBookingPublicAPI(bookingPayload)
      const booking = bookingResult?.booking ? bookingResult.booking : bookingResult
      const guestAccess = bookingResult?.guestAccess

      if (guestAccess?.referenceCode && guestAccess?.accessToken && booking?.id) {
        sessionStorage.setItem(
          'guest_booking_access',
          JSON.stringify({
            bookingId: booking.id,
            referenceCode: guestAccess.referenceCode,
            token: guestAccess.accessToken,
          })
        )
        toast.info('Guest booking created. Save your reference/token for lookup.')
      }

      // Confirm booking and send e-ticket email (works for both logged-in and guest users)
      if (booking?.id) {
        await confirmAndSendEmailPublicAPI(booking.id)
        toast.success('E-ticket sent to your email!')
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Payment simulated successfully!')

      // Redirect to success page
      // router.push(`/payment/success?bookingId=${booking.id}`)
      // Redirect to confirmation page (the PayOS success page requires orderCode)
      router.push(`/booking/confirmation?bookingId=${booking.id}&bookingRef=${booking.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Dev payment failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Payment simulation failed.'
      toast.error(errorMessage)
      setIsProcessing(false)
    }
  }

  // Development only: Simulate payment cancellation
  const handleDevCancelPayment = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setIsProcessing(true)

    try {
      // Prepare booking payload
      const seatIds = bookingData.seats.split(',')
      const bookingPayload = {
        tripId: bookingData.tripId,
        seatIds: seatIds,
        passengers: bookingData.passengers.map((p: any, index: number) => ({
          fullName: p.fullName,
          documentId: p.documentId,
          seatCode: p.seatCode || seatIds[index],
        })),
        totalAmount: Number(bookingData.totalPrice),
        contactInfo: bookingData.contactInfo,
      }

      console.log('Creating booking with payload:', bookingPayload)

      // Create booking
      const bookingResult = await createBookingPublicAPI(bookingPayload)
      const booking = bookingResult?.booking ? bookingResult.booking : bookingResult
      const guestAccess = bookingResult?.guestAccess

      if (guestAccess?.referenceCode && guestAccess?.accessToken && booking?.id) {
        sessionStorage.setItem(
          'guest_booking_access',
          JSON.stringify({
            bookingId: booking.id,
            referenceCode: guestAccess.referenceCode,
            token: guestAccess.accessToken,
          })
        )
      }

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.info('Payment cancellation simulated')

      // Redirect to cancel page (seats will be released automatically)
      router.push(`/payment/cancel?bookingId=${booking.id}&orderCode=DEV_CANCEL`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Dev cancel payment failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Cancellation simulation failed.'
      toast.error(errorMessage)
      setIsProcessing(false)
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

  if (!bookingData || !trip) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Invalid booking data. Please start over.</p>
            <Button onClick={() => router.push('/homepage')} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Passenger Details
        </button>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-gray-900 dark:text-white font-medium">Search</span>
              </div>
              <div className="w-16 h-0.5 bg-green-500"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-gray-900 dark:text-white font-medium">Details</span>
              </div>
              <div className="w-16 h-0.5 bg-blue-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                  3
                </div>
                <span className="text-gray-900 dark:text-white font-medium">Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-gray-900 dark:text-white">
            Seats held for: <span className="text-amber-600 dark:text-amber-400 font-bold">{formatTime(timeLeft)}</span>
          </span>
        </div>

        <form onSubmit={handlePayment}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Route:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {trip.route?.originStop?.name} → {trip.route?.destinationStop?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Departure:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(trip.departureTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Passengers:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{bookingData.passengers.length}</span>
                  </div>
                  {bookingData.passengers.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between pl-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">• {p.fullName}</span>
                      <span className="text-gray-600 dark:text-gray-400">ID: {p.documentId}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method - PayOS */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        PayOS Payment Gateway
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Secure payment with multiple options
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          <CreditCard className="w-3 h-3" />
                          Credit/Debit Card
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          <Smartphone className="w-3 h-3" />
                          E-Wallet
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          <Building2 className="w-3 h-3" />
                          Bank Transfer
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          <QrCode className="w-3 h-3" />
                          QR Code
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    After clicking &quot;Continue to Payment&quot;, you will be redirected to PayOS secure payment page
                    where you can choose your preferred payment method.
                  </p>
                </div>

                {/* Terms and Conditions */}
                <div className="mt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Price Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ticket Price</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(bookingData.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(0)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(bookingData.totalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to PayOS...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Continue to Payment
                    </>
                  )}
                </Button>

                {/* Development Mode: Skip Payment Button */}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Button
                      type="button"
                      onClick={handleDevPayment}
                      disabled={isProcessing}
                      className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Skip Payment (Dev Only)
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDevCancelPayment}
                      disabled={isProcessing}
                      className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Cancel Payment (Dev Only)
                        </>
                      )}
                    </Button>
                  </>
                )}

                <p className="text-gray-600 dark:text-gray-400 text-center text-xs mt-4">
                  🔒 Secure payment powered by PayOS
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
