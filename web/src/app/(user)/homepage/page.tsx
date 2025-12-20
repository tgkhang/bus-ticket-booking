'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Search, Clock, TrendingUp, Ticket, ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { autocompleteStopsAPI, getPopularRoutesAPI, type PopularRouteItem } from '@/lib/api'
import { addRecentSearch, loadRecentSearches, type RecentSearchItem } from '@/utils/recentSearches'

interface Stop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

type PopularRoute = PopularRouteItem

export default function UserHomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  })

  const [fromSuggestions, setFromSuggestions] = useState<Stop[]>([])
  const [toSuggestions, setToSuggestions] = useState<Stop[]>([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [selectedOriginStop, setSelectedOriginStop] = useState<Stop | null>(null)
  const [selectedDestinationStop, setSelectedDestinationStop] = useState<Stop | null>(null)

  // Pagination state
  const [fromPage, setFromPage] = useState(1)
  const [toPage, setToPage] = useState(1)
  const [hasMoreFrom, setHasMoreFrom] = useState(true)
  const [hasMoreTo, setHasMoreTo] = useState(true)
  const [loadingFrom, setLoadingFrom] = useState(false)
  const [loadingTo, setLoadingTo] = useState(false)

  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([])
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([])

  useEffect(() => {
    setRecentSearches(loadRecentSearches())
  }, [])

  useEffect(() => {
    const loadPopular = async () => {
      try {
        const routes = await getPopularRoutesAPI(4)
        setPopularRoutes(routes.slice(0, 4))
      } catch (e) {
        setPopularRoutes([])
      }
    }
    loadPopular()
  }, [])

  const fetchStops = async (query: string, page: number, type: 'from' | 'to') => {
    try {
      if (type === 'from') setLoadingFrom(true)
      else setLoadingTo(true)

      const limit = 5
      const results = await autocompleteStopsAPI(query, limit, page)
      
      if (type === 'from') {
        if (page === 1) setFromSuggestions(results)
        else setFromSuggestions(prev => [...prev, ...results])
        setHasMoreFrom(results.length === limit)
      } else {
        if (page === 1) setToSuggestions(results)
        else setToSuggestions(prev => [...prev, ...results])
        setHasMoreTo(results.length === limit)
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (type === 'from') setLoadingFrom(false)
      else setLoadingTo(false)
    }
  }

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setFromPage(1)
      fetchStops(searchData.from, 1, 'from')
    }, 300)
    return () => clearTimeout(timer)
  }, [searchData.from])

  useEffect(() => {
    const timer = setTimeout(() => {
      setToPage(1)
      fetchStops(searchData.to, 1, 'to')
    }, 300)
    return () => clearTimeout(timer)
  }, [searchData.to])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'from' | 'to') => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 1) { // +1 for tolerance
      if (type === 'from' && hasMoreFrom && !loadingFrom) {
        const nextPage = fromPage + 1
        setFromPage(nextPage)
        fetchStops(searchData.from, nextPage, 'from')
      } else if (type === 'to' && hasMoreTo && !loadingTo) {
        const nextPage = toPage + 1
        setToPage(nextPage)
        fetchStops(searchData.to, nextPage, 'to')
      }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Allow search with just date - show all trips if no valid stops selected
    if (searchData.date) {
      const params = new URLSearchParams({
        date: searchData.date,
        passengers: searchData.passengers.toString(),
      })

      // Only send stop IDs if valid stops were selected from suggestions
      if (selectedOriginStop) {
        params.set('originStopId', selectedOriginStop.id)
        params.set('fromText', selectedOriginStop.name)
      } else if (searchData.from) {
        params.set('fromText', searchData.from)
      }
      
      if (selectedDestinationStop) {
        params.set('destinationStopId', selectedDestinationStop.id)
        params.set('toText', selectedDestinationStop.name)
      } else if (searchData.to) {
        params.set('toText', searchData.to)
      }

      const fromText = selectedOriginStop ? selectedOriginStop.name : searchData.from
      const toText = selectedDestinationStop ? selectedDestinationStop.name : searchData.to

      const nextRecent = addRecentSearch({
        fromText: fromText || 'All Stops',
        toText: toText || 'All Stops',
        originStopId: selectedOriginStop?.id,
        destinationStopId: selectedDestinationStop?.id,
        date: searchData.date,
        passengers: searchData.passengers,
      })
      setRecentSearches(nextRecent)

      router.push(`/trips/search?${params.toString()}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return ''
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h <= 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  const buildSearchUrl = (input: {
    originStopId?: string
    destinationStopId?: string
    fromText?: string
    toText?: string
    date: string
    passengers: number
  }) => {
    const params = new URLSearchParams({
      date: input.date,
      passengers: input.passengers.toString(),
    })
    if (input.originStopId) params.set('originStopId', input.originStopId)
    if (input.destinationStopId) params.set('destinationStopId', input.destinationStopId)
    if (input.fromText) params.set('fromText', input.fromText)
    if (input.toText) params.set('toText', input.toText)
    return `/trips/search?${params.toString()}`
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Find your next journey</p>
        </div>

        {/* Search Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Bus Tickets</h2>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* From */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchData.from}
                    onChange={(e) => {
                      setSearchData({ ...searchData, from: e.target.value })
                      setShowFromDropdown(true)
                      setSelectedOriginStop(null)
                    }}
                    onFocus={() => setShowFromDropdown(true)}
                    onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                    placeholder="Select departure stop"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showFromDropdown && fromSuggestions.length > 0 && (
                    <div 
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                      onScroll={(e) => handleScroll(e, 'from')}
                    >
                      {fromSuggestions.map((stop) => (
                        <button
                          key={stop.id}
                          type="button"
                          onMouseDown={() => {
                            setSearchData({ ...searchData, from: stop.name })
                            setSelectedOriginStop(stop)
                            setShowFromDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-start gap-2"
                        >
                          <MapPin className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{stop.name}</p>
                            {stop.address && (
                              <p className="text-gray-500 dark:text-gray-400 text-sm">{stop.address}</p>
                            )}
                          </div>
                        </button>
                      ))}
                      {loadingFrom && (
                        <div className="p-2 text-center text-gray-500 text-sm">Loading...</div>
                      )}
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
                    value={searchData.to}
                    onChange={(e) => {
                      setSearchData({ ...searchData, to: e.target.value })
                      setShowToDropdown(true)
                      setSelectedDestinationStop(null)
                    }}
                    onFocus={() => setShowToDropdown(true)}
                    onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                    placeholder="Select destination stop"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showToDropdown && toSuggestions.length > 0 && (
                    <div 
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                      onScroll={(e) => handleScroll(e, 'to')}
                    >
                      {toSuggestions.map((stop) => (
                        <button
                          key={stop.id}
                          type="button"
                          onMouseDown={() => {
                            setSearchData({ ...searchData, to: stop.name })
                            setSelectedDestinationStop(stop)
                            setShowToDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-start gap-2"
                        >
                          <MapPin className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{stop.name}</p>
                            {stop.address && (
                              <p className="text-gray-500 dark:text-gray-400 text-sm">{stop.address}</p>
                            )}
                          </div>
                        </button>
                      ))}
                      {loadingTo && (
                        <div className="p-2 text-center text-gray-500 text-sm">Loading...</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  required
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passengers
                </label>
                <select
                  value={searchData.passengers}
                  onChange={(e) =>
                    setSearchData({ ...searchData, passengers: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Buses
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Searches and Popular Routes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Searches</h3>
                </div>

                <div className="space-y-3">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => router.push(buildSearchUrl({
                        originStopId: search.originStopId,
                        destinationStopId: search.destinationStopId,
                        fromText: search.fromText,
                        toText: search.toText,
                        date: search.date,
                        passengers: search.passengers,
                      }))}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {search.fromText} → {search.toText}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {search.date} • {search.passengers} passenger{search.passengers > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Routes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Popular Routes</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularRoutes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0]
                      const nextRecent = addRecentSearch({
                        fromText: route.from,
                        toText: route.to,
                        originStopId: route.originStopId,
                        destinationStopId: route.destinationStopId,
                        date: today,
                        passengers: 1,
                      })
                      setRecentSearches(nextRecent)
                      router.push(buildSearchUrl({
                        originStopId: route.originStopId,
                        destinationStopId: route.destinationStopId,
                        fromText: route.from,
                        toText: route.to,
                        date: today,
                        passengers: 1,
                      }))
                    }}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {route.from} → {route.to}
                      </p>
                      <span className="text-green-600 font-bold text-sm">
                        {formatCurrency(route.minPrice)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {route.avgDurationMinutes ? `${formatDuration(route.avgDurationMinutes)} • ` : ''}
                      {route.bookings} booking{route.bookings === 1 ? '' : 's'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - User Stats */}
          <div className="space-y-4">
            <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Ticket className="w-8 h-8" />
                <div>
                  <p className="text-blue-100 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/booking')}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                View All Bookings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-8 h-8" />
                <div>
                  <p className="text-green-100 text-sm">Upcoming Trips</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>
              <p className="text-green-100 text-sm">No trips scheduled</p>
            </div>

            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8" />
                <div>
                  <p className="text-purple-100 text-sm">Rewards Points</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-purple-100 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Start booking to earn points!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
