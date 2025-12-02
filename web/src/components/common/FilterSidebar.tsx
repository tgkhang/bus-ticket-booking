'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { 
  Clock, 
  DollarSign, 
  Wifi, 
  Wind,
  Droplet,
  Usb,
  X, 
  SlidersHorizontal,
  Users,
  Tv,
  Lamp,
  Armchair
} from 'lucide-react'

interface FilterState {
  timeSlots: string[]
  priceRange: [number, number]
  amenities: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  totalResults: number
  isLoading?: boolean
}

const TIME_SLOTS = [
  { id: 'early_morning', label: 'Early Morning', time: '0:00 AM - 6:00 AM', icon: '🌙' },
  { id: 'morning', label: 'Morning', time: '6:01 AM - 12:00 PM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', time: '12:01 PM - 6:00 PM', icon: '☀️' },
  { id: 'evening', label: 'Evening', time: '6:01 PM - 11:59 PM', icon: '🌆' },
]

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
  { id: 'water', label: 'Water', icon: Droplet },
  { id: 'usb_charging', label: 'USB Charging', icon: Usb },
  { id: 'restroom', label: 'Restroom', icon: Users },
  { id: 'entertainment', label: 'Entertainment', icon: Tv },
  { id: 'reading_light', label: 'Reading Light', icon: Lamp },
  { id: 'reclining_seats', label: 'Reclining Seats', icon: Armchair },
  { id: 'blanket', label: 'Blanket', icon: Wind },
]

function FilterSidebar({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults,
  isLoading = false,
}: FilterSidebarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  // Keep local inputs as strings to preserve caret/focus during partial edits
  const [priceMinStr, setPriceMinStr] = useState(String(filters.priceRange[0]))
  const [priceMaxStr, setPriceMaxStr] = useState(String(filters.priceRange[1]))
  const typingRef = useRef<{ minFocused: boolean; maxFocused: boolean }>({ minFocused: false, maxFocused: false })
  const debounceRef = useRef<number | null>(null)

  const handleTimeSlotToggle = (slotId: string) => {
    const newTimeSlots = filters.timeSlots.includes(slotId)
      ? []
      : [slotId]
    onFiltersChange({ ...filters, timeSlots: newTimeSlots })
  }

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter((id) => id !== amenityId)
      : [...filters.amenities, amenityId]
    onFiltersChange({ ...filters, amenities: newAmenities })
  }

  // Sync local strings from filters when not focused (avoid clobbering while user types)
  useEffect(() => {
    if (typingRef.current.minFocused || typingRef.current.maxFocused) return
    setPriceMinStr(String(filters.priceRange[0]))
    setPriceMaxStr(String(filters.priceRange[1]))
  }, [filters.priceRange])

  const commitPriceChange = () => {
    const minParsed = priceMinStr.trim() === '' ? NaN : Number(priceMinStr)
    const maxParsed = priceMaxStr.trim() === '' ? NaN : Number(priceMaxStr)

    if (Number.isNaN(minParsed) || Number.isNaN(maxParsed)) return

    const nextRange: [number, number] = [minParsed, maxParsed]
    const prevRange = filters.priceRange
    if (nextRange[0] === prevRange[0] && nextRange[1] === prevRange[1]) return

    onFiltersChange({ ...filters, priceRange: nextRange })
  }

  // Debounce commit when user stops typing and inputs are not focused
  useEffect(() => {
    if (typingRef.current.minFocused || typingRef.current.maxFocused) return

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }
    debounceRef.current = window.setTimeout(() => {
      commitPriceChange()
    }, 300)

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [priceMinStr, priceMaxStr])

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitPriceChange()
      e.preventDefault()
    }
  }

  const hasActiveFilters =
    filters.timeSlots.length > 0 ||
    filters.amenities.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000000

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
            disabled={isLoading}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">{totalResults}</span> {totalResults === 1 ? 'trip' : 'trips'} found
        </p>
      </div>
      {/* Departure Time */}
      <div className="space-y-3 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Departure Time</h4>
        </div>
        <div className="space-y-2">
          {TIME_SLOTS.map((slot) => (
            <label key={slot.id} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={filters.timeSlots.includes(slot.id)}
                onChange={() => handleTimeSlotToggle(slot.id)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xl">{slot.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{slot.label}</div>
                <div className="text-xs text-gray-500">{slot.time}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Price Range</h4>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Min Price (VND)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={priceMinStr}
                onChange={(e) => setPriceMinStr(e.target.value)}
                onFocus={() => { typingRef.current.minFocused = true }}
                // onBlur={() => { typingRef.current.minFocused = false; commitPriceChange() }}
                onKeyDown={handlePriceKeyDown}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Max Price (VND)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={priceMaxStr}
                onChange={(e) => setPriceMaxStr(e.target.value)}
                onFocus={() => { typingRef.current.maxFocused = true }}
                // onBlur={() => { typingRef.current.maxFocused = false; commitPriceChange() }}
                onKeyDown={handlePriceKeyDown}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000000"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{(priceMinStr.trim() === '' ? 0 : Number(priceMinStr)).toLocaleString('vi-VN')} đ</span>
            <span>{(priceMaxStr.trim() === '' ? 0 : Number(priceMaxStr)).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Amenities</h4>
        <div className="space-y-2">
          {AMENITIES.map((amenity) => {
            const Icon = amenity.icon
            return (
              <label key={amenity.id} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-900">{amenity.label}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
          {FilterContent()}
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {filters.timeSlots.length + filters.amenities.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {FilterContent()}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Show {totalResults} Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(FilterSidebar)
