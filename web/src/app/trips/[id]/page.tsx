'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTripByIdAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Bus, 
  Wifi, 
  Wind, 
  Droplet, 
  Usb, 
  Tv, 
  Lamp, 
  Armchair,
  Star,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

// Mock Reviews Data
const MOCK_REVIEWS = [
  {
    id: 1,
    user: 'Alice Nguyen',
    rating: 5,
    date: '2023-10-15',
    comment: 'Great trip! The bus was clean and on time. The driver was very professional.',
    avatar: 'AN'
  },
  {
    id: 2,
    user: 'Minh Tran',
    rating: 4,
    date: '2023-10-12',
    comment: 'Comfortable seats, but the wifi was a bit spotty. Overall good experience.',
    avatar: 'MT'
  },
  {
    id: 3,
    user: 'Sarah Le',
    rating: 5,
    date: '2023-10-05',
    comment: 'Excellent service. Will definitely book again.',
    avatar: 'SL'
  }
]

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  ac: Wind,
  water: Droplet,
  usb_charging: Usb,
  entertainment: Tv,
  reading_light: Lamp,
  reclining_seats: Armchair,
  blanket: Wind, // Reuse Wind or find better icon
  restroom: Info // Placeholder
}

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Free WiFi',
  ac: 'Air Conditioning',
  water: 'Water Bottle',
  usb_charging: 'USB Charging',
  entertainment: 'Entertainment System',
  reading_light: 'Reading Light',
  reclining_seats: 'Reclining Seats',
  blanket: 'Blanket',
  restroom: 'Restroom'
}

export default function TripDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await getTripByIdAPI(params.id as string)
        setTrip(data)
      } catch (error) {
        console.error('Failed to fetch trip details:', error)
        toast.error('Failed to load trip details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTrip()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Trip not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Calculate stops for visualization
  // Combine origin, destination and intermediate stops
  const allStops = [
    {
      id: 'origin',
      stop: trip.route.originStop,
      time: trip.departureTime,
      type: 'pickup',
      isOrigin: true
    },
    ...(trip.route.stops || []).map((s: any) => ({
      id: s.id,
      stop: s.stop,
      time: null, // We might need to estimate time based on sequence/distance if not provided
      type: s.isPickup ? 'pickup' : s.isDropoff ? 'dropoff' : 'stop',
      isIntermediate: true
    })),
    {
      id: 'destination',
      stop: trip.route.destinationStop,
      time: trip.arrivalTime,
      type: 'dropoff',
      isDestination: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {trip.route.originStop.name} <span className="text-gray-400">→</span> {trip.route.destinationStop.name}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(trip.departureTime)}
                <span className="mx-1">•</span>
                <Clock className="w-4 h-4" />
                {formatTime(trip.departureTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Route Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {allStops.map((stop, index) => (
                    <div key={stop.id} className="relative">
                      <div className={`absolute -left-[29px] w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white
                        ${stop.isOrigin ? 'border-blue-600 text-blue-600' : 
                          stop.isDestination ? 'border-green-600 text-green-600' : 'border-gray-300 text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${stop.isOrigin ? 'bg-blue-600' : stop.isDestination ? 'bg-green-600' : 'bg-gray-300'}`} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{stop.stop.name}</h4>
                          <p className="text-sm text-gray-500">{stop.stop.address}</p>
                          {stop.type === 'pickup' && <Badge variant="default" className="mt-1 text-blue-600 border-blue-200 bg-blue-50">Pickup Point</Badge>}
                          {stop.type === 'dropoff' && <Badge variant="default" className="mt-1 text-green-600 border-green-200 bg-green-50">Dropoff Point</Badge>}
                        </div>
                        {stop.time && (
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{formatTime(stop.time)}</div>
                            {stop.isDestination && (
                              <div className="text-xs text-gray-500">
                                Duration: {Math.floor(trip.durationMinutes / 60)}h {trip.durationMinutes % 60}m
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bus Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-blue-600" />
                  Bus Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Operator</p>
                    <p className="font-medium text-gray-900">{trip.bus.operator.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bus Model</p>
                    <p className="font-medium text-gray-900">{trip.bus.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Plate Number</p>
                    <p className="font-medium text-gray-900">{trip.bus.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Seat Capacity</p>
                    <p className="font-medium text-gray-900">{trip.bus.seatCapacity} seats</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(trip.bus.amenities || {}).map(([key, value]) => {
                      if (!value) return null
                      const Icon = AMENITY_ICONS[key] || Info
                      return (
                        <div key={key} className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{AMENITY_LABELS[key] || key}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Cancel 24h before departure: 100% refund</li>
                    <li>Cancel 12h before departure: 50% refund</li>
                    <li>Cancel less than 12h before departure: No refund</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Boarding Policy</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Please arrive at the boarding point 15 minutes before departure.</li>
                    <li>Present your e-ticket and valid ID proof while boarding.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">4.8</div>
                  <div>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">Based on 128 reviews</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {review.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{review.user}</span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="text-blue-900">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-gray-600">Base Fare</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(Number(trip.basePrice))}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                      <span>Total Price</span>
                      <span>{formatCurrency(Number(trip.basePrice))}</span>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={() => toast.info('Booking flow coming soon!')}>
                        Book Now
                      </Button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        By clicking Book Now, you agree to our Terms & Conditions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Need Help?</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Call our customer support at <br/>
                        <span className="font-semibold text-blue-600">1900 1234</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
