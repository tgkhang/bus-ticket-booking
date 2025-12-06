'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getSeatStatusesAPI, getTripByIdAPI, lockSeatsAPI } from '@/lib/api'
import { ArrowLeft, Radio, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { toast } from 'sonner'

type SeatStatus = 'available' | 'booked' | 'locked' | 'selected'

interface Seat {
  id: string
  code: string
  status: SeatStatus
  price: number
}

interface SeatStatusResponse {
  id: string
  seatId: string
  seatCode: string
  status: string
  lockedUntil: string | null
}

export default function SeatSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const tripId = params?.id as string

  const [trip, setTrip] = useState<any>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get passengers from URL params (from search page)
  const passengers = parseInt(searchParams.get('passengers') || '1')

  useEffect(() => {
    const fetchData = async () => {
      if (!tripId) {
        setError('Invalid trip ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch trip details and seat statuses
        const [tripData, seatStatusData] = await Promise.all([
          getTripByIdAPI(tripId),
          getSeatStatusesAPI(tripId),
        ])

        // Backend returns trip directly (not wrapped in { data: ... })
        setTrip(tripData)

        // Backend returns array directly (not wrapped in { data: [...] })
        const transformedSeats: Seat[] = (seatStatusData as SeatStatusResponse[]).map((ss: SeatStatusResponse) => ({
          id: ss.seatId,
          code: ss.seatCode,
          status: ss.status as SeatStatus,
          price: tripData.basePrice,
        }))

        setSeats(transformedSeats)
        
        // Check if user is returning from passenger details with locked seats
        const returnedSeats = searchParams.get('lockedSeats')
        if (returnedSeats) {
          const lockedSeatIds = returnedSeats.split(',')
          // Select seats that are locked (user's previous selection)
          const seatsToSelect = lockedSeatIds.filter(seatId => {
            const seat = transformedSeats.find(s => s.id === seatId)
            return seat && seat.status === 'locked'
          })
          
          if (seatsToSelect.length > 0) {
            setSelectedSeats(seatsToSelect)
            // Mark them as selected in the UI
            setSeats(transformedSeats.map(s => 
              seatsToSelect.includes(s.id) ? { ...s, status: 'selected' as SeatStatus } : s
            ))
            toast.info(`Restored ${seatsToSelect.length} previously selected seat(s)`)
          }
        }
      } catch (err) {
        console.error('Failed to fetch seat data:', err)
        setError('Failed to load seat information')
        toast.error('Failed to load seat information')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tripId])

  const handleSeatClick = async (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat || seat.status === 'booked' || seat.status === 'locked') return

    if (selectedSeats.includes(seatId)) {
      // Deselect
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId))
      setSeats(
        seats.map((s) => (s.id === seatId ? { ...s, status: 'available' as SeatStatus } : s))
      )
    } else {
      // Select (limit to number of passengers)
      if (selectedSeats.length < passengers) {
        setSelectedSeats([...selectedSeats, seatId])
        setSeats(
          seats.map((s) => (s.id === seatId ? { ...s, status: 'selected' as SeatStatus } : s))
        )
      } else {
        toast.warning(`You can only select up to ${passengers} seat(s)`)
      }
    }
  }

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600 cursor-pointer'
      case 'booked':
        return 'bg-red-500 cursor-not-allowed'
      case 'selected':
        return 'bg-amber-500 cursor-pointer'
      case 'locked':
        return 'bg-orange-500 cursor-not-allowed'
      default:
        return 'bg-gray-300'
    }
  }

  const totalPrice = selectedSeats.length * (trip?.basePrice || 0)

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }

    try {
      // Lock seats before proceeding
      await lockSeatsAPI(tripId, selectedSeats, 10) // Lock for 10 minutes
      
      router.push(`/booking/passenger-details?tripId=${tripId}&seats=${selectedSeats.join(',')}&totalPrice=${totalPrice}&passengers=${selectedSeats.length}`)
    } catch (err) {
      console.error('Failed to lock seats:', err)
      toast.error('Failed to lock seats. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error || 'Trip not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Group seats by rows (assuming 4 seats per row: A, B, C, D)
  const groupSeatsByRow = () => {
    const rows: { [key: number]: Seat[] } = {}
    seats.forEach((seat) => {
      // Safety check: ensure seat.code exists before matching
      if (!seat.code) {
        console.warn('Seat without code:', seat)
        return
      }
      const match = seat.code.match(/([A-D])(\d+)/)
      if (match) {
        const row = parseInt(match[2])
        if (!rows[row]) rows[row] = []
        rows[row].push(seat)
      }
    })
    return rows
  }

  const seatRows = groupSeatsByRow()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search Results
        </button>

        {/* Trip Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Route</p>
              <p className="text-gray-900 font-medium">
                {trip.route?.originStop?.name} → {trip.route?.destinationStop?.name}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Date & Time</p>
              <p className="text-gray-900 font-medium">
                {new Date(trip.departureTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Duration</p>
              <p className="text-gray-900 font-medium">{trip.durationMinutes} minutes</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Price per seat</p>
              <p className="text-gray-900 font-medium">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(trip.basePrice)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Select Your Seats</h2>
                <div className="flex items-center gap-2 text-green-600">
                  <Radio className="w-4 h-4" />
                  <span className="text-sm">Live updates enabled</span>
                </div>
              </div>

              {/* Bus Layout */}
              <div className="max-w-md mx-auto">
                {/* Driver */}
                <div className="flex justify-end mb-6 pb-4 border-b-2 border-gray-300">
                  <div className="bg-gray-700 text-white px-6 py-2 rounded-t-lg text-sm font-medium">
                    Driver
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="space-y-3">
                  {Object.keys(seatRows)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((rowNum) => {
                      const row = seatRows[Number(rowNum)]
                      const sortedSeats = row.sort((a, b) => a.code.localeCompare(b.code))

                      return (
                        <div key={rowNum} className="grid grid-cols-4 gap-3">
                          {sortedSeats.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat.id)}
                              disabled={seat.status === 'booked' || seat.status === 'locked'}
                              className={`${getSeatColor(
                                seat.status
                              )} text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70`}
                            >
                              {seat.code}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-500 rounded"></div>
                    <span className="text-sm text-gray-700">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-700">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-700">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Passengers</p>
                  <p className="text-gray-900 font-medium">{passengers} {passengers === 1 ? 'person' : 'people'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Selected Seats ({selectedSeats.length}/{passengers})</p>
                  <p className="text-gray-900 font-medium">
                    {selectedSeats.length > 0
                      ? seats
                          .filter((s) => selectedSeats.includes(s.id))
                          .map((s) => s.code)
                          .join(', ')
                      : 'None'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(totalPrice)}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue
              </Button>

              {selectedSeats.length === 0 && (
                <p className="text-red-500 text-center text-sm mt-3">
                  Please select your seats to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
