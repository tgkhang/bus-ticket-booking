'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Search, Clock, TrendingUp, Ticket, ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { autocompleteStopsAPI } from '@/lib/api'

interface Stop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

interface RecentSearch {
  id: string
  from: string
  fromId: string
  to: string
  toId: string
  date: string
}

interface PopularRoute {
  id: string
  from: string
  to: string
  price: number
  duration: string
  trips: number
}

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

  // Mock data - in production, fetch from API
  const recentSearches: RecentSearch[] = []

  const popularRoutes: PopularRoute[] = [
    {
      id: '1',
      from: 'Ho Chi Minh City',
      to: 'Da Lat',
      price: 350000,
      duration: '6h 30m',
      trips: 12,
    },
    {
      id: '2',
      from: 'Hanoi',
      to: 'Ha Long Bay',
      price: 280000,
      duration: '4h 15m',
      trips: 8,
    },
    {
      id: '3',
      from: 'Da Nang',
      to: 'Hoi An',
      price: 150000,
      duration: '1h 30m',
      trips: 15,
    },
    {
      id: '4',
      from: 'HCMC',
      to: 'Vung Tau',
      price: 180000,
      duration: '2h 45m',
      trips: 10,
    },
  ]

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchData.from && searchData.from.length >= 2) {
        try {
          const results = await autocompleteStopsAPI(searchData.from, 5)
          setFromSuggestions(results)
        } catch (error) {
          setFromSuggestions([])
        }
      } else {
        setFromSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchData.from])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchData.to && searchData.to.length >= 2) {
        try {
          const results = await autocompleteStopsAPI(searchData.to, 5)
          setToSuggestions(results)
        } catch (error) {
          setToSuggestions([])
        }
      } else {
        setToSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchData.to])

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

      router.push(`/trips/search?${params.toString()}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-xl text-gray-600">Find your next journey</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Search Bus Tickets</h2>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* From */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
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
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showFromDropdown && fromSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {fromSuggestions.map((stop) => (
                        <button
                          key={stop.id}
                          type="button"
                          onClick={() => {
                            setSearchData({ ...searchData, from: stop.name })
                            setSelectedOriginStop(stop)
                            setShowFromDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-start gap-2"
                        >
                          <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-900 font-medium">{stop.name}</p>
                            {stop.address && (
                              <p className="text-gray-500 text-sm">{stop.address}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* To */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
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
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showToDropdown && toSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {toSuggestions.map((stop) => (
                        <button
                          key={stop.id}
                          type="button"
                          onClick={() => {
                            setSearchData({ ...searchData, to: stop.name })
                            setSelectedDestinationStop(stop)
                            setShowToDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-start gap-2"
                        >
                          <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-900 font-medium">{stop.name}</p>
                            {stop.address && (
                              <p className="text-gray-500 text-sm">{stop.address}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passengers
                </label>
                <select
                  value={searchData.passengers}
                  onChange={(e) =>
                    setSearchData({ ...searchData, passengers: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Recent Searches</h3>
                </div>

                <div className="space-y-3">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() =>
                        router.push(
                          `/trips/search?originStopId=${search.fromId}&destinationStopId=${search.toId}&date=${search.date}&passengers=1`
                        )
                      }
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-md hover:border-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-gray-900 font-medium">
                            {search.from} → {search.to}
                          </p>
                          <p className="text-gray-600 text-sm">{search.date}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Routes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Popular Routes</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularRoutes.map((route) => (
                  <button
                    key={route.id}
                    className="p-4 border border-gray-200 rounded-md hover:border-green-600 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-900 font-medium">
                        {route.from} → {route.to}
                      </p>
                      <span className="text-green-600 font-bold text-sm">
                        {formatCurrency(route.price)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {route.duration} • {route.trips} trips/day
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - User Stats */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
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

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-8 h-8" />
                <div>
                  <p className="text-green-100 text-sm">Upcoming Trips</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>
              <p className="text-green-100 text-sm">No trips scheduled</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
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
      </main>
    </div>
  )
}
