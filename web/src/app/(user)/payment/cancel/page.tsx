'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle, Loader2, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cancelBookingAPI } from '@/lib/api'
import { toast } from 'sonner'

function CancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [isCancelled, setIsCancelled] = useState(false)

  useEffect(() => {
    const cancelBooking = async () => {
      const bookingId = searchParams.get('bookingId')

      if (!bookingId) {
        setIsProcessing(false)
        return
      }

      try {
        // Cancel the booking to release seats
        await cancelBookingAPI(bookingId)
        setIsCancelled(true)
        setIsProcessing(false)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error cancelling booking:', err)
        // Even if cancellation fails, still show the cancel page
        // Seats will be released after 30-minute timeout
        setIsProcessing(false)
        toast.error('Could not cancel booking automatically. Seats will be released shortly.')
      }
    }

    cancelBooking()
  }, [searchParams])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Processing Cancellation</h1>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we release your seats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Cancelled</h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your payment has been cancelled. No charges were made to your account.
          {isCancelled && ' Your seats have been released and are now available for booking.'}
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            If you have any questions, please email us at{' '}
            <a href="mailto:support@payos.vn" className="font-semibold hover:underline inline-flex items-center gap-1">
              <Mail className="w-4 h-4" />
              support@payos.vn
            </a>
          </p>
        </div>

        <Button onClick={() => router.push('/')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  )
}
