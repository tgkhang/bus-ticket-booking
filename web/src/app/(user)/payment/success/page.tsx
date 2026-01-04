'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, ArrowRight, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getBookingByIdAPI, getBookingPublicByReferenceAPI } from '@/lib/api'
import { getPaymentLinkInfoAPI } from '@/lib/api/payment'

interface BookingData {
  id: string
  totalAmount: number
  status: string
  trip?: {
    departureTime: string
    route?: {
      originCity: string
      destinationCity: string
    }
  }
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [guestAccess, setGuestAccess] = useState<{ referenceCode: string; token: string } | null>(null)

  useEffect(() => {
    const waitForWebhookConfirmation = async () => {
      const bookingId = searchParams.get('bookingId')
      const orderCode = searchParams.get('orderCode')

      if (!bookingId || !orderCode) {
        setError('Missing booking or payment information')
        setIsProcessing(false)
        return
      }

      // Guest flow: rely on webhook confirmation + public booking lookup.
      try {
        const raw = sessionStorage.getItem('guest_booking_access')
        if (raw) {
          const parsed = JSON.parse(raw)
          const referenceCode = parsed?.referenceCode
          const token = parsed?.token
          const storedBookingId = parsed?.bookingId

          if (referenceCode && token) {
            setGuestAccess({ referenceCode, token })
          }

          if (storedBookingId === bookingId && referenceCode && token) {
            const maxAttempts = 10
            let attempts = 0
            console.log(`[Payment Success - Guest] Starting to poll booking status (max ${maxAttempts} attempts)`)

            while (attempts < maxAttempts) {
              attempts++
              console.log(`[Payment Success - Guest] Polling attempt ${attempts}/${maxAttempts}`)

              try {
                const booking = await getBookingPublicByReferenceAPI(referenceCode, token)
                console.log(`[Payment Success - Guest] Booking status: ${booking?.status}`)

                if (booking?.status === 'confirmed') {
                  console.log(`[Payment Success - Guest] ✅ Webhook confirmed booking after ${attempts} attempts!`)
                  setBookingData(booking)
                  setIsProcessing(false)
                  toast.success('Booking confirmed! Your e-ticket has been sent via email.')
                  return
                }
              } catch (err) {
                console.error(`[Payment Success - Guest] Lookup failed (attempt ${attempts}):`, err)
              }

              if (attempts < maxAttempts) {
                console.log(`[Payment Success - Guest] Waiting 1 second before next attempt...`)
                await new Promise((resolve) => setTimeout(resolve, 1000))
              }
            }

            // If not confirmed yet, still show success page.
            console.warn(`[Payment Success - Guest] ⚠️ Timeout after ${maxAttempts} attempts. Webhook still processing.`)
            setIsProcessing(false)
            toast.success('Payment received. Booking confirmation may take a moment.')
            return
          }
        }
      } catch {
        // ignore malformed sessionStorage
      }

      try {
        // Verify payment was successful from PayOS
        console.log(`[Payment Success] Verifying payment for orderCode: ${orderCode}`)
        const paymentInfo = await getPaymentLinkInfoAPI(orderCode)
        console.log(`[Payment Success] PayOS status: ${paymentInfo.data.status}`)

        if (paymentInfo.data.status !== 'PAID') {
          console.error(`[Payment Success] Payment not completed. Status: ${paymentInfo.data.status}`)
          setError('Payment was not completed successfully')
          setIsProcessing(false)
          return
        }

        // Poll booking status until webhook confirms it (max 5 seconds)
        const maxAttempts = 5
        let attempts = 0
        console.log(`[Payment Success] Starting to poll booking status (max ${maxAttempts} attempts)`)

        while (attempts < maxAttempts) {
          attempts++
          console.log(`[Payment Success] Polling attempt ${attempts}/${maxAttempts} for bookingId: ${bookingId}`)

          try {
            const booking = await getBookingByIdAPI(bookingId)
            console.log(`[Payment Success] Booking status: ${booking?.status}`)

            if (booking?.status === 'confirmed') {
              console.log(`[Payment Success] ✅ Webhook confirmed booking after ${attempts} attempts!`)
              setBookingData(booking)
              setIsProcessing(false)
              toast.success('Payment successful! Your e-ticket has been sent via email.')
              return
            }
          } catch (err) {
            console.error(`[Payment Success] Error checking booking status (attempt ${attempts}):`, err)
          }

          // Wait 1 second before next attempt
          if (attempts < maxAttempts) {
            console.log(`[Payment Success] Waiting 1 second before next attempt...`)
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }

        // If webhook didn't confirm after polling, still show success
        // The webhook will process in the background
        console.warn(`[Payment Success] ⚠️ Timeout after ${maxAttempts} attempts. Webhook still processing in background.`)
        console.log(`[Payment Success] Showing success page anyway. Booking will be confirmed by webhook asynchronously.`)
        setIsProcessing(false)
        toast.success('Payment successful! Your booking is being confirmed...')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error confirming payment:', err)
        setError(err.response?.data?.message || 'Failed to confirm booking')
        setIsProcessing(false)
        toast.error('Failed to confirm booking. Please contact support.')
      }
    }

    waitForWebhookConfirmation()
  }, [searchParams])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Confirming Your Booking</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we verify your payment and prepare your e-ticket...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Confirmation Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Please contact our support team with your order details for assistance.
          </p>
          <Button onClick={() => router.push('/')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Go to Home
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  const bookingId = searchParams.get('bookingId')
  const orderCode = searchParams.get('orderCode')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for your payment. Your booking has been confirmed.
          </p>
        </div>

        {bookingData && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">#{bookingData.id}</span>
              </div>
              {bookingData.trip && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Route:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {bookingData.trip.route?.originCity} → {bookingData.trip.route?.destinationCity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Departure:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(bookingData.trip.departureTime).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {bookingData.totalAmount?.toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="font-medium text-green-600 dark:text-green-400">Confirmed</span>
              </div>
            </div>
          </div>
        )}

        {guestAccess && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
              📋 Save these credentials to manage your booking:
            </p>
            <div className="text-sm text-gray-900 dark:text-white break-all space-y-1">
              <div>
                <span className="font-semibold">Reference Code:</span> {guestAccess.referenceCode}
              </div>
              <div>
                <span className="font-semibold">Access Token:</span> {guestAccess.token}
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800 dark:text-green-300">
            ✅ An e-ticket has been sent to your email address. Please check your inbox.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => router.push(`/booking/confirmation?bookingId=${bookingId}&orderCode=${orderCode}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Ticket className="w-5 h-5 mr-2" />
            View E-Ticket
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
            Go to Home
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
