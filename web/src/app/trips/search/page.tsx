'use client'

import { useEffect, useState, Suspense, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchTripsAPI, autocompleteStopsAPI } from '@/lib/api'
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Loader2, 
  Search,
  AlertCircle,
  Bus,
  ChevronDown,
  ChevronUp,
  Users,
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

// Helper to convert time slots to time ranges for API
const getTimeRange = (slots: string[]) => {
  if (slots.length === 0) return {}
  
  let minStart = '23:59'
  let maxEnd = '00:00'
  
  const ranges: Record<string, { start: string; end: string }> = {
    early_morning: { start: '00:00', end: '06:00' },
    morning: { start: '06:01', end: '12:00' },
    afternoon: { start: '12:01', end: '18:00' },
    evening: { start: '18:01', end: '23:59' },
  }

  slots.forEach(slot => {
    const range = ranges[slot]
    if (range) {
      if (range.start < minStart) minStart = range.start
      if (range.end > maxEnd) maxEnd = range.end
    }
  })
  
  return { startTime: minStart, endTime: maxEnd }
}

// Helper to convert time range from API to time slots
const getTimeSlotsFromRange = (start?: string | null, end?: string | null) => {
  if (!start || !end) return []
  const slots: string[] = []
  if (start <= '00:00' && end >= '06:00') slots.push('early_morning')
  if (start <= '06:01' && end >= '12:00') slots.push('morning')
  if (start <= '12:01' && end >= '18:00') slots.push('afternoon')
  if (start <= '18:01' && end >= '23:59') slots.push('evening')
  return slots
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<SearchResponse['meta'] | null>(null)
  const isInitialLoad = useRef(true)
  const scrollPositionRef = useRef(0)
  
  // Derived state from URL
  const filters = useMemo<FilterState>(() => {
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const amenities = searchParams.get('amenities')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')

    return {
      timeSlots: getTimeSlotsFromRange(startTime, endTime),
      priceRange: [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 10000000
      ],
      amenities: amenities ? amenities.split(',') : [],
    }
  }, [searchParams])

  const sortBy = useMemo(() => {
    const field = searchParams.get('sortBy')
    const order = searchParams.get('sortOrder')
    if (field && order) {
      return `${field}:${order}`
    }
    return 'departure:asc'
  }, [searchParams])

  const updateFilters = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update price
    if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0].toString())
    else params.delete('minPrice')
    
    if (newFilters.priceRange[1] < 10000000) params.set('maxPrice', newFilters.priceRange[1].toString())
    else params.delete('maxPrice')

    // Update amenities
    if (newFilters.amenities.length > 0) params.set('amenities', newFilters.amenities.join(','))
    else params.delete('amenities')

    // Update time slots
    const timeRange = getTimeRange(newFilters.timeSlots)
    if (timeRange.startTime) params.set('startTime', timeRange.startTime)
    else params.delete('startTime')
    
    if (timeRange.endTime) params.set('endTime', timeRange.endTime)
    else params.delete('endTime')

    // Reset page to 1 on filter change
    params.set('page', '1')

    router.push(`/trips/search?${params.toString()}`)
  }, [searchParams, router])

  const updateSort = useCallback((newSort: string) => {
    const [field, order] = newSort.split(':')
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', field)
    params.set('sortOrder', order)
    router.push(`/trips/search?${params.toString()}`)
  }, [searchParams, router])

  // Search editor state
  const [showSearchEditor, setShowSearchEditor] = useState(false)
  const [editFrom, setEditFrom] = useState('')
  const [editTo, setEditTo] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editPassengers, setEditPassengers] = useState(1)
  const [fromSuggestions, setFromSuggestions] = useState<Stop[]>([])
  const [toSuggestions, setToSuggestions] = useState<Stop[]>([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [selectedOriginStop, setSelectedOriginStop] = useState<Stop | null>(null)
  const [selectedDestinationStop, setSelectedDestinationStop] = useState<Stop | null>(null)

  const originStopId = searchParams.get('originStopId')
  const destinationStopId = searchParams.get('destinationStopId')
  const fromText = searchParams.get('fromText')
  const toText = searchParams.get('toText')
  const date = searchParams.get('date')
  const page = parseInt(searchParams.get('page') || '1')
  const passengers = parseInt(searchParams.get('passengers') || '1')

  // Initialize edit form with current search params
  useEffect(() => {
    // Use text from URL params to preserve user input
    setEditFrom(fromText || '')
    setEditTo(toText || '')
    setEditDate(date || '')
    setEditPassengers(passengers)
    
    // Set selected stops if we have valid stop IDs and trips data
    if (originStopId && trips.length > 0 && trips[0].originStop) {
      setSelectedOriginStop(trips[0].originStop)
    } else {
      setSelectedOriginStop(null)
    }
    
    if (destinationStopId && trips.length > 0 && trips[0].destinationStop) {
      setSelectedDestinationStop(trips[0].destinationStop)
    } else {
      setSelectedDestinationStop(null)
    }
  }, [fromText, toText, originStopId, destinationStopId, date, passengers, trips])

  // Debounced autocomplete for "from" field
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (editFrom && editFrom.length >= 2 && showFromDropdown) {
        try {
          const results = await autocompleteStopsAPI(editFrom, 5)
          setFromSuggestions(results)
        } catch (error) {
          setFromSuggestions([])
        }
      } else {
        setFromSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [editFrom, showFromDropdown])

  // Debounced autocomplete for "to" field
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (editTo && editTo.length >= 2 && showToDropdown) {
        try {
          const results = await autocompleteStopsAPI(editTo, 5)
          setToSuggestions(results)
        } catch (error) {
          setToSuggestions([])
        }
      } else {
        setToSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [editTo, showToDropdown])



  useEffect(() => {
    const fetchTrips = async () => {
      // Only date is required - show all trips if no stops specified
      if (!date) {
        setError('Please select a travel date.')
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
        
        // Call API with stop IDs only if they exist
        // If omitted, API will return all trips for that date
        const response: any = await searchTripsAPI({
          originStopId: originStopId || undefined,
          destinationStopId: destinationStopId || undefined,
          date,
          passengers,
          page,
          limit: 5,
          status: 'scheduled',
          sortBy: sortField,
          sortOrder: sortOrder as 'asc' | 'desc',
          minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          maxPrice: filters.priceRange[1] < 10000000 ? filters.priceRange[1] : undefined,
          amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined,
          ...timeRange,
        })

        // Backend returns flat structure: { data, total, page, limit, totalPages }
        setTrips(response.data || [])
        setMeta({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        })
        
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
        // Don't show error for invalid searches, just show no results
        setTrips([])
        setMeta(null)
      } finally {
        setLoading(false)
        isInitialLoad.current = false
      }
    }

    fetchTrips()
  }, [originStopId, destinationStopId, date, page, filters, sortBy])

  const handleClearFilters = () => {
    updateFilters({
      timeSlots: [],
      priceRange: [0, 10000000],
      amenities: [],
    })
  }

  const handleUpdateSearch = () => {
    if (editDate) {
      const params = new URLSearchParams({
        date: editDate,
        passengers: editPassengers.toString(),
      })

      // Only send stop IDs if valid stops were selected from suggestions
      if (selectedOriginStop) {
        params.set('originStopId', selectedOriginStop.id)
        params.set('fromText', selectedOriginStop.name)
      } else if (editFrom) {
        params.set('fromText', editFrom)
      }
      
      if (selectedDestinationStop) {
        params.set('destinationStopId', selectedDestinationStop.id)
        params.set('toText', selectedDestinationStop.name)
      } else if (editTo) {
        params.set('toText', editTo)
      }

      router.push(`/trips/search?${params.toString()}`)
      setShowSearchEditor(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading && trips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Searching for available trips...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/homepage">
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors">
                ← Back to Home
              </button>
            </Link>
          </div>
          
          {/* Search Summary/Editor */}
          {!showSearchEditor ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {fromText || 'All Stops'}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {toText || 'All Stops'}
                </span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>{date && formatDate(date)}</span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span>{passengers} passenger{passengers > 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                onClick={() => setShowSearchEditor(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                Edit Search
              </button>
            </div>
          ) : (
            <div className="p-6 bg-linear-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg border border-blue-100 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Your Search</h3>
                <button
                  onClick={() => setShowSearchEditor(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* From */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editFrom}
                      onChange={(e) => {
                        setEditFrom(e.target.value)
                        setShowFromDropdown(true)
                        setSelectedOriginStop(null)
                      }}
                      onFocus={() => setShowFromDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                      placeholder="Select departure stop"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    
                    {showFromDropdown && fromSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {fromSuggestions.map((stop) => (
                          <button
                            key={stop.id}
                            type="button"
                            onClick={() => {
                              setEditFrom(stop.name)
                              setSelectedOriginStop(stop)
                              setShowFromDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-start gap-2"
                          >
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">{stop.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* To */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editTo}
                      onChange={(e) => {
                        setEditTo(e.target.value)
                        setShowToDropdown(true)
                        setSelectedDestinationStop(null)
                      }}
                      onFocus={() => setShowToDropdown(true)}
                      onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                      placeholder="Select destination stop"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    
                    {showToDropdown && toSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {toSuggestions.map((stop) => (
                          <button
                            key={stop.id}
                            type="button"
                            onClick={() => {
                              setEditTo(stop.name)
                              setSelectedDestinationStop(stop)
                              setShowToDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-start gap-2"
                          >
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">{stop.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>

                {/* Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      type="number"
                      value={editPassengers}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setEditPassengers(Math.min(val, 10));
                      }}
                      min="1"
                      max="10"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowSearchEditor(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleUpdateSearch}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Search
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFiltersChange={updateFilters}
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
              ) : (
                <>
                  {/* Sort and Results Count */}
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? 'Loading...' : `${meta?.total || trips.length} ${trips.length === 1 ? 'Trip' : 'Trips'} Available`}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <label htmlFor="sortBy" className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        Sort by:
                      </label>
                      <div className="relative">
                        <select
                          id="sortBy"
                          value={sortBy}
                          onChange={(e) => updateSort(e.target.value)}
                          disabled={loading}
                          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                      <span className="text-sm text-blue-900 dark:text-blue-300">Updating results...</span>
                    </div>
                  )}

                  {/* No Results Message */}
                  {!loading && trips.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                      <Bus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Trips Found</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                        {originStopId || destinationStopId 
                          ? 'No trips available for this route and filters. Try clearing your location filters or adjusting your search criteria.'
                          : 'No trips available on this date. Try selecting a different date.'}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={handleClearFilters} variant="outline">
                          Clear Filters
                        </Button>
                        <Button onClick={() => router.push('/homepage')} className="bg-blue-600 hover:bg-blue-700">
                          New Search
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Trip Cards */}
                  {trips.length > 0 && (
                    <div className="space-y-4">
                      {trips.map((trip) => (
                        <TripCard 
                          key={trip.id} 
                          trip={trip} 
                          passengers={passengers}
                          currentPath={typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {meta && meta.totalPages > 1 && (
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                          onClick={() => {
                            if (page > 1) {
                              const params = new URLSearchParams(searchParams.toString())
                              params.set('page', (page - 1).toString())
                              router.push(`/trips/search?${params.toString()}`)
                            }
                          }}
                          disabled={page === 1}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            page === 1
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-2">
                          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => {
                            // Show first page, last page, current page, and pages around current
                            const showPage = 
                              pageNum === 1 || 
                              pageNum === meta.totalPages || 
                              (pageNum >= page - 1 && pageNum <= page + 1)
                            
                            // Show ellipsis
                            const showEllipsisBefore = pageNum === page - 2 && page > 3
                            const showEllipsisAfter = pageNum === page + 2 && page < meta.totalPages - 2

                            if (showEllipsisBefore || showEllipsisAfter) {
                              return (
                                <span key={pageNum} className="px-2 py-2 text-gray-500 dark:text-gray-400">
                                  ...
                                </span>
                              )
                            }

                            if (!showPage) return null

                            return (
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
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => {
                            if (page < meta.totalPages) {
                              const params = new URLSearchParams(searchParams.toString())
                              params.set('page', (page + 1).toString())
                              router.push(`/trips/search?${params.toString()}`)
                            }
                          }}
                          disabled={page === meta.totalPages}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            page === meta.totalPages
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          Next
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Page Info */}
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Page {page} of {meta.totalPages} ({meta.total} total trips)
                      </p>
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
