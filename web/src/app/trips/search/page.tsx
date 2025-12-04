'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchTripsAPI } from '@/lib/api'
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Loader2, 
  Search,
  AlertCircle,
  Bus,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import FilterSidebar from '@/components/common/FilterSidebar'
import TripCard from '@/components/common/TripCard'

interface Stop {
  id: string
  name: string
}

interface Bus {
  model: string
  amenities: Record<string, boolean>
}

interface Trip {
  id: string
  routeId: string
  operatorId: string
  busId: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  status: string
  durationMinutes: number
  originStop: Stop
  destinationStop: Stop
  bus: Bus
}

interface SearchResponse {
  data: Trip[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface FilterState {
  timeSlots: string[]
  priceRange: [number, number]
  amenities: string[]
}

const SORT_OPTIONS = [
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'departure:asc', label: 'Departure: Earliest First' },
  { value: 'departure:desc', label: 'Departure: Latest First' },
  { value: 'duration:asc', label: 'Duration: Shortest First' },
  { value: 'duration:desc', label: 'Duration: Longest First' },
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<SearchResponse['meta'] | null>(null)
  const isInitialLoad = useRef(true)
  const scrollPositionRef = useRef(0)
  
  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    timeSlots: [],
    priceRange: [0, 10000000],
    amenities: [],
  })
  const [sortBy, setSortBy] = useState('departure:asc')

  const originStopId = searchParams.get('originStopId')
  const destinationStopId = searchParams.get('destinationStopId')
  const date = searchParams.get('date')
  const page = parseInt(searchParams.get('page') || '1')

  // Convert time slots to time ranges for API
  const getTimeRange = (slots: string[]) => {
    if (slots.length === 0) return {}
    // Map time slots to hour ranges
    const timeMap: Record<string, { start: string; end: string }> = {
      early_morning: { start: '00:00', end: '06:00' },
      morning: { start: '06:01', end: '12:00' },
      afternoon: { start: '12:01', end: '18:00' },
      evening: { start: '18:01', end: '23:59' },
    }
    // For simplicity, if multiple slots selected, use the earliest start and latest end
    // In a real app, you might want to handle this differently
    if (slots.includes('early_morning')) return { startTime: '00:00', endTime: '06:00' }
    if (slots.includes('morning')) return { startTime: '06:01', endTime: '12:00' }
    if (slots.includes('afternoon')) return { startTime: '12:01', endTime: '18:00' }
    if (slots.includes('evening')) return { startTime: '18:01', endTime: '23:59' }
    return {}
  }

  useEffect(() => {
    const fetchTrips = async () => {
      if (!originStopId || !destinationStopId || !date) {
        setError('Missing required search parameters')
        setLoading(false)
        return
      }

      // Save current scroll position before loading (always after first load)
      if (!isInitialLoad.current) {
        scrollPositionRef.current = window.scrollY
      }

      setLoading(true)
      setError(null)

      try {
        const [sortField, sortOrder] = sortBy.split(':')
        const timeRange = getTimeRange(filters.timeSlots)
        
        const response: SearchResponse = await searchTripsAPI({
          originStopId,
          destinationStopId,
          date,
          page,
          limit: 10,
          status: 'scheduled',
          sortBy: sortField,
          sortOrder: sortOrder as 'asc' | 'desc',
          minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          maxPrice: filters.priceRange[1] < 10000000 ? filters.priceRange[1] : undefined,
          amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined,
          ...timeRange,
        })

        setTrips(response.data || [])
        setMeta(response.meta)
        
        // Restore scroll position after filter change (but not on initial load)
        if (!isInitialLoad.current) {
          const y = scrollPositionRef.current
          // Use double rAF to ensure layout + paint are completed
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.scrollTo({ top: y, behavior: 'auto' })
            })
          })
        }
      } catch (err) {
        console.error('Failed to fetch trips:', err)
        setError('Failed to load trips. Please try again.')
      } finally {
        setLoading(false)
        isInitialLoad.current = false
      }
    }

    fetchTrips()
  }, [originStopId, destinationStopId, date, page, filters, sortBy])

  const handleClearFilters = () => {
    setFilters({
      timeSlots: [],
      priceRange: [0, 10000000],
      amenities: [],
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading && trips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching for available trips...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors">
                ← Back to Home
              </button>
            </Link>
          </div>
          
          {trips.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">{trips[0].originStop.name}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">{trips[0].destinationStop.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{date && formatDate(date)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
              totalResults={meta?.total || trips.length}
              isLoading={loading}
            />
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3">
            {loading && trips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600 text-lg">Searching for trips...</p>
                </div>
              ) : trips.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Trips Found</h2>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any trips matching your search criteria. Try adjusting your filters or search parameters.
                  </p>
                  <Button onClick={handleClearFilters} className="bg-blue-600 hover:bg-blue-700">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  {/* Sort and Results Count */}
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {loading ? 'Loading...' : `${meta?.total || trips.length} ${trips.length === 1 ? 'Trip' : 'Trips'} Available`}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <label htmlFor="sortBy" className="text-sm text-gray-600 whitespace-nowrap">
                        Sort by:
                      </label>
                      <div className="relative">
                        <select
                          id="sortBy"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          disabled={loading}
                          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Loading Overlay */}
                  {loading && trips.length > 0 && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-900">Updating results...</span>
                    </div>
                  )}

                  {/* Trip Cards */}
                  <div className="space-y-4">
                    {trips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {meta && meta.totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('page', pageNum.toString())
                            router.push(`/trips/search?${params.toString()}`)
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            pageNum === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}

export default function TripSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
