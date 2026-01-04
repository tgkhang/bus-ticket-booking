import { Suspense } from 'react'
import BookingsList from './BookingsList'

export const dynamic = 'force-dynamic'

export default function MyBookingsPage() {
  return (
    <Suspense fallback={
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
    }>
      <BookingsList />
    </Suspense>
  )
}
