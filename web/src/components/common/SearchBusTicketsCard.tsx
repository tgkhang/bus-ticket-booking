'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { autocompleteStopsAPI } from '@/lib/api'
import { addRecentSearch, type RecentSearchItem } from '@/utils/recentSearches'

interface Stop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export default function SearchBusTicketsCard(props: {
  showBrowseStopsRoutesButton?: boolean
  onRecentSearchesUpdated?: (items: RecentSearchItem[]) => void
}) {
  const router = useRouter()
  const { showBrowseStopsRoutesButton = true, onRecentSearchesUpdated } = props

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

  const [fromPage, setFromPage] = useState(1)
  const [toPage, setToPage] = useState(1)
  const [hasMoreFrom, setHasMoreFrom] = useState(true)
  const [hasMoreTo, setHasMoreTo] = useState(true)
  const [loadingFrom, setLoadingFrom] = useState(false)
  const [loadingTo, setLoadingTo] = useState(false)

  const fetchStops = async (query: string, page: number, type: 'from' | 'to') => {
    try {
      if (type === 'from') setLoadingFrom(true)
      else setLoadingTo(true)

      const limit = 5
      const results = await autocompleteStopsAPI(query, limit, page)

      if (type === 'from') {
        if (page === 1) setFromSuggestions(results)
        else setFromSuggestions((prev) => [...prev, ...results])
        setHasMoreFrom(results.length === limit)
      } else {
        if (page === 1) setToSuggestions(results)
        else setToSuggestions((prev) => [...prev, ...results])
        setHasMoreTo(results.length === limit)
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (type === 'from') setLoadingFrom(false)
      else setLoadingTo(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setFromPage(1)
      fetchStops(searchData.from, 1, 'from')
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData.from])

  useEffect(() => {
    const timer = setTimeout(() => {
      setToPage(1)
      fetchStops(searchData.to, 1, 'to')
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData.to])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'from' | 'to') => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 1) {
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

    if (searchData.date) {
      const params = new URLSearchParams({
        date: searchData.date,
        passengers: searchData.passengers.toString(),
      })

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
      onRecentSearchesUpdated?.(nextRecent)

      router.push(`/trips/search?${params.toString()}`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Bus Tickets</h2>
        </div>

        {showBrowseStopsRoutesButton && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/routes-stops')}
            className="shrink-0"
          >
            Browse Stops & Routes
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  {loadingFrom && <div className="p-2 text-center text-gray-500 text-sm">Loading...</div>}
                </div>
              )}
            </div>
          </div>

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
                  {loadingTo && <div className="p-2 text-center text-gray-500 text-sm">Loading...</div>}
                </div>
              )}
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passengers</label>
            <select
              value={searchData.passengers}
              onChange={(e) => setSearchData({ ...searchData, passengers: parseInt(e.target.value) })}
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
  )
}
