'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Details</h1>
          <p className="text-gray-600">Trip ID: {tripId}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-800">
            🚧 Trip details and seat selection page is under construction. 
            This will include seat layout, pricing, and booking functionality.
          </p>
        </div>

        <Button
          onClick={() => router.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search Results
        </Button>
      </div>
    </div>
  )
}
