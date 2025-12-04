'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Calendar, Loader2 } from 'lucide-react'
import StopAutocomplete from '@/components/common/StopAutocomplete'
import { Button } from '@/components/ui/button'

interface Stop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export default function TripSearchForm() {
  const router = useRouter()
  const [originStop, setOriginStop] = useState<Stop | null>(null)
  const [destinationStop, setDestinationStop] = useState<Stop | null>(null)
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState<{ origin?: string; destination?: string; date?: string }>({})
  const [isSearching, setIsSearching] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: { origin?: string; destination?: string; date?: string } = {}
    
    if (!originStop) {
      newErrors.origin = 'Please select a departure location'
    }
    if (!destinationStop) {
      newErrors.destination = 'Please select a destination'
    }
    if (!date) {
      newErrors.date = 'Please select a date'
    }
    if (originStop && destinationStop && originStop.id === destinationStop.id) {
      newErrors.destination = 'Destination must be different from origin'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    // Build search URL with query params
    setIsSearching(true)
    const searchParams = new URLSearchParams({
      originStopId: originStop!.id,
      destinationStopId: destinationStop!.id,
      date: date,
    })

    // Redirect to search results page
    router.push(`/trips/search?${searchParams.toString()}`)
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Find Your Bus</h2>
            <p className="text-gray-600">Search for available trips across Vietnam</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin Stop */}
            <div>
              <StopAutocomplete
                value={originStop}
                onChange={(stop) => {
                  setOriginStop(stop)
                  if (errors.origin) {
                    setErrors({ ...errors, origin: undefined })
                  }
                }}
                label="From"
                placeholder="Enter departure city or stop"
                error={errors.origin}
              />
            </div>

            {/* Destination Stop */}
            <div>
              <StopAutocomplete
                value={destinationStop}
                onChange={(stop) => {
                  setDestinationStop(stop)
                  if (errors.destination) {
                    setErrors({ ...errors, destination: undefined })
                  }
                }}
                label="To"
                placeholder="Enter destination city or stop"
                error={errors.destination}
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Departure Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    if (errors.date) {
                      setErrors({ ...errors, date: undefined })
                    }
                  }}
                  min={today}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            {/* Placeholder for future filters */}
            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passengers (Coming Soon)
                </label>
                <input
                  type="number"
                  disabled
                  placeholder="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-lg text-lg font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Trips
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            💡 <span className="font-medium">Pro tip:</span> Book early to get the best prices and seat selection
          </p>
        </div>
      </div>
    </div>
  )
}
