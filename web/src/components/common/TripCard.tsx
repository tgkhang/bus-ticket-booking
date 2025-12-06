'use client'

import { useRouter } from 'next/navigation'
import { Clock, MapPin, Bus, Wifi, Wind, Droplet, Usb, ArrowRight, Users, Tv, Lamp, Armchair } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    amenities: Record<string, boolean>
  }
  status: string
}

interface TripCardProps {
  trip: Trip
  passengers?: number
  currentPath?: string
}

const amenityConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, label: string }> = {
  wifi: { icon: Wifi, label: 'WiFi' },
  ac: { icon: Wind, label: 'AC' },
  water: { icon: Droplet, label: 'Water' },
  usb_charging: { icon: Usb, label: 'USB Charging' },
  restroom: { icon: Users, label: 'Restroom' },
  entertainment: { icon: Tv, label: 'Entertainment' },
  reading_light: { icon: Lamp, label: 'Reading Light' },
  reclining_seats: { icon: Armchair, label: 'Reclining Seats' },
  blanket: { icon: Wind, label: 'Blanket' },
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group">
      <div className="p-6">
        {/* Trip Header - Time and Route */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
          {/* Left: Departure & Arrival Times */}
          <div className="flex-1">
            <div className="flex items-center gap-6">
              {/* Departure */}
              <div className="shrink-0">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatTime(trip.departureTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {trip.originStop.name}
                </div>
              </div>

              {/* Duration Line */}
              <div className="flex-1 flex flex-col items-center min-w-[100px]">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(trip.durationMinutes)}
                </div>
                <div className="w-full relative">
                  <div className="h-px bg-gray-300 dark:bg-gray-600 w-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2">
                    <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Direct</div>
              </div>

              {/* Arrival */}
              <div className="shrink-0 text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatTime(trip.arrivalTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1 justify-end">
                  <MapPin className="w-3 h-3" />
                  {trip.destinationStop.name}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Price and Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
            <div className="text-center lg:text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">From</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(trip.basePrice)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">per seat</div>
            </div>
            <Button 
              onClick={() => {
                // Pass the current path as a URL param temporarily so the seats page can store it
                router.push(`/booking/seats/${trip.id}?passengers=${passengers}${currentPath ? `&from=${encodeURIComponent(currentPath)}` : ''}`)
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 group-hover:scale-105 transition-transform"
            >
              Select Seats
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Trip Details - Bus Model and Amenities */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Bus Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{trip.bus.model}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {trip.availableSeats !== undefined ? (
                      <span className={trip.availableSeats < passengers ? 'text-orange-600 font-medium' : 'text-green-600'}>
                        {trip.availableSeats} {trip.availableSeats === 1 ? 'seat' : 'seats'} available
                      </span>
                    ) : (
                      'Check availability'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {activeAmenities.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {activeAmenities.slice(0, 4).map((amenity) => {
                  const config = amenityConfig[amenity]
                  if (!config) return null
                  const Icon = config.icon
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs text-gray-700 dark:text-gray-300"
                      title={config.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{config.label}</span>
                    </div>
                  )
                })}
                {activeAmenities.length > 4 && (
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs text-gray-700 dark:text-gray-300">
                    +{activeAmenities.length - 4} more
                  </div>
                )}
              </div>
            )}
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
