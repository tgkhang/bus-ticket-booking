'use client'

import { useRouter } from 'next/navigation'
import { Clock, MapPin, Bus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { amenityOptions } from '@/utils/constants'

interface Stop {
  id: string
  name: string
}

interface Trip {
  id: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  durationMinutes: number
  availableSeats?: number
  originStop: Stop
  destinationStop: Stop
  bus: {
    model: string
    busType?: string
    amenities: Record<string, boolean>
  }
  status: string
}

interface TripCardProps {
  trip: Trip
  passengers?: number
  currentPath?: string
}

export default function TripCard({ trip, passengers = 1, currentPath }: TripCardProps) {
  const router = useRouter()
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  // Get active amenities
  const activeAmenities = trip.bus.amenities
    ? Object.entries(trip.bus.amenities)
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
    : []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Operator Info */}
          <div className="flex items-center gap-4 lg:w-48">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
              <Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white font-bold wrap-break-word" title={trip.bus.model}>
                {trip.bus.model}
              </h3>
              {trip.bus.busType && (
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  {trip.bus.busType}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {trip.availableSeats !== undefined ? (
                  <span className={trip.availableSeats < passengers ? 'text-orange-600 font-medium' : 'text-green-600'}>
                    {trip.availableSeats} seats left
                  </span>
                ) : (
                  'Check availability'
                )}
              </div>
            </div>
          </div>

          {/* Trip Details (Middle) */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="text-center shrink-0 w-24 sm:w-32">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatTime(trip.departureTime)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mx-auto" title={trip.originStop.name}>
                  {trip.originStop.name}
                </div>
              </div>

              {/* Duration & Amenities */}
              <div className="flex-1 flex flex-col items-center min-w-0">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatDuration(trip.durationMinutes)}</span>
                </div>
                <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 relative">
                  <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-4 h-4 text-gray-400" />
                </div>
                {/* Amenities */}
                <div className="hidden lg:grid grid-cols-5 gap-x-2 gap-y-1 mt-2 justify-items-center">
                  {activeAmenities.slice(0, 10).map((amenity) => {
                    const option = amenityOptions.find(opt => opt.value === amenity)
                    if (!option) return null
                    const Icon = option.icon
                    return (
                      <div
                        key={amenity}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={option.label}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center shrink-0 w-24 sm:w-32">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatTime(trip.arrivalTime)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mx-auto" title={trip.destinationStop.name}>
                  {trip.destinationStop.name}
                </div>
              </div>
            </div>
          </div>

          {/* Price & Buttons (Right) */}
          <div className="flex flex-col items-end gap-3 shrink-0 ml-4 w-full lg:w-auto">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {formatPrice(trip.basePrice)}
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[140px]">
              <Button 
                onClick={() => router.push(`/trips/${trip.id}`)}
                variant="outline"
                className="w-full"
              >
                View Details
              </Button>
              <Button 
                onClick={() => {
                  // Pass the current path as a URL param temporarily so the seats page can store it
                  router.push(`/booking/seats/${trip.id}?passengers=${passengers}${currentPath ? `&from=${encodeURIComponent(currentPath)}` : ''}`)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Select Seats
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      {trip.status !== 'scheduled' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 px-6 py-2">
          <p className="text-xs text-yellow-800 dark:text-yellow-300 capitalize">{trip.status}</p>
        </div>
      )}
    </div>
  )
}
