'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { confirmBookingAPI } from '@/lib/api'
import { sendETicketEmailAPI } from '@/lib/api/eTicket'
import { getPaymentLinkInfoAPI } from '@/lib/api/payment'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const bookingId = searchParams.get('bookingId')
      const orderCode = searchParams.get('orderCode')

      if (!bookingId || !orderCode) {
        setError('Missing booking or payment information')
        setIsProcessing(false)
        return
      }

      try {
        // Get payment information from PayOS
        const paymentInfo = await getPaymentLinkInfoAPI(orderCode)

        // Verify payment was successful
        if (paymentInfo.data.status !== 'PAID') {
          setError('Payment was not completed successfully')
          setIsProcessing(false)
          return
        }

        // Confirm booking with payment details
        await confirmBookingAPI(bookingId, {
          provider: 'payos',
          transactionRef: orderCode,
        })

        // Send e-ticket email
        await sendETicketEmailAPI(bookingId)

        setIsProcessing(false)
        toast.success('Booking confirmed and e-ticket sent!')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error confirming payment:', err)
        setError(err.response?.data?.message || 'Failed to confirm booking')
        setIsProcessing(false)
        toast.error('Failed to confirm booking. Please contact support.')
      }
    }

    confirmPayment()
  }, [searchParams])

  useEffect(() => {
    if (isProcessing || error) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, isProcessing, error])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Processing Your Payment</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we confirm your booking and send your e-ticket...
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
          <Button onClick={() => router.push('/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for using PayOS! Your booking has been confirmed and you should receive an e-ticket via email
          shortly.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800 dark:text-green-300">
            Redirecting to your bookings in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>

        <Button onClick={() => router.push('/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          View My Bookings
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
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
