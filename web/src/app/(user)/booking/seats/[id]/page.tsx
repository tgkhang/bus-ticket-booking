'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getSeatStatusesAPI, getTripByIdAPI, lockSeatsAPI, unlockSeatsAPI } from '@/lib/api'
import { ArrowLeft, Radio, AlertCircle, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { detectLayoutAndGroupSeats, detectLayoutPattern } from '@/utils/seatLayout'
import { useBookingSocket } from '@/contexts/BookingSocketContext'

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

  const socket = useBookingSocket()

  const [trip, setTrip] = useState<any>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const selectedSeatsRef = useRef<string[]>([])

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats
  }, [selectedSeats])
  
  // Get passengers from URL params (from search page)
  const passengers = parseInt(searchParams.get('passengers') || '1')

  // Socket listeners (socket is provided by booking layout and stays connected across booking pages)
  useEffect(() => {
    if (!socket) return

    const onLocked = ({ tripId: eventTripId, seatIds }: { tripId: string; seatIds: string[] }) => {
      if (eventTripId !== tripId) return

      setSeats((prev) =>
        prev.map((s) => {
          if (!seatIds.includes(s.id)) return s
          if (s.status === 'booked' || selectedSeatsRef.current.includes(s.id)) return s
          return { ...s, status: 'locked' }
        })
      )
    }

    const onUnlocked = ({ tripId: eventTripId, seatIds }: { tripId: string; seatIds: string[] }) => {
      if (eventTripId !== tripId) return

      setSeats((prev) =>
        prev.map((s) => {
          if (!seatIds.includes(s.id)) return s
          if (s.status === 'booked' || selectedSeatsRef.current.includes(s.id)) return s
          return { ...s, status: 'available' }
        })
      )
    }

    const onBooked = ({ tripId: eventTripId, seatIds }: { tripId: string; seatIds: string[] }) => {
      if (eventTripId !== tripId) return

      setSeats((prev) => prev.map((s) => (seatIds.includes(s.id) ? { ...s, status: 'booked' } : s)))

      setSelectedSeats((prevSelected) => {
        const conflict = prevSelected.some((id) => seatIds.includes(id))
        if (conflict) toast.error('Some of your selected seats were booked by another user.')
        return prevSelected.filter((id) => !seatIds.includes(id))
      })
    }

    socket.on('seats:locked', onLocked)
    socket.on('seats:unlocked', onUnlocked)
    socket.on('seats:booked', onBooked)

    return () => {
      socket.off('seats:locked', onLocked)
      socket.off('seats:unlocked', onUnlocked)
      socket.off('seats:booked', onBooked)
    }
  }, [socket, tripId])

  // Store returnUrl in session storage when arriving from search page
  useEffect(() => {
    const fromParam = searchParams.get('from')
    if (fromParam) {
      sessionStorage.setItem(`returnUrl_${tripId}`, fromParam)
    }
  }, [searchParams, tripId])

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
        
        // Check if user is returning from passenger details (via session storage)
        const pendingSeats = sessionStorage.getItem(`pending_seats_${tripId}`)
        if (pendingSeats) {
          const lockedSeatIds = JSON.parse(pendingSeats) as string[]
          
          // Unlock them so user can re-select or change
          try {
            await unlockSeatsAPI(tripId, lockedSeatIds)
            sessionStorage.removeItem(`pending_seats_${tripId}`)
            
            // Restore selection in UI
            setSelectedSeats(lockedSeatIds)
            setSeats(prev => prev.map(s => 
              lockedSeatIds.includes(s.id) ? { ...s, status: 'selected' as SeatStatus } : s
            ))
            toast.info('Previous selection restored')
          } catch (e) {
            console.error('Failed to unlock pending seats', e)
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
      await lockSeatsAPI(tripId, selectedSeats)
      
      // Save to session storage in case user comes back
      sessionStorage.setItem(`pending_seats_${tripId}`, JSON.stringify(selectedSeats))

      router.push(`/booking/passenger-details?tripId=${tripId}&seats=${selectedSeats.join(',')}&totalPrice=${totalPrice}&passengers=${selectedSeats.length}`)
    } catch (err: any) {
      console.error('Failed to lock seats:', err)
      
      if (err.response?.status === 409) {
        toast.error('Some seats are already taken. Refreshing...')
      } else {
        toast.error('Failed to lock seats. Please try again.')
      }
      
      // Refresh seats
      const seatStatusData = await getSeatStatusesAPI(tripId)
      const transformedSeats: Seat[] = (seatStatusData as SeatStatusResponse[]).map((ss: SeatStatusResponse) => ({
        id: ss.seatId,
        code: ss.seatCode,
        status: ss.status as SeatStatus,
        price: trip?.basePrice || 0,
      }))
      setSeats(transformedSeats)
      // Clear invalid selection
      setSelectedSeats([])
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">{error || 'Trip not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Detect layout pattern from seat codes and group seats by rows
  const { rows: seatRows, columns } = detectLayoutAndGroupSeats(seats)
  const layoutPattern = detectLayoutPattern(columns)

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            // Check if we have search params from trip search or stored in session
            const returnUrl = searchParams.get('returnUrl') || searchParams.get('from') || sessionStorage.getItem(`returnUrl_${tripId}`)
            if (returnUrl) {
              router.push(returnUrl)
            } else {
              router.back()
            }
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search Results
        </button>

        {/* Trip Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Trip Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Route</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {trip.route?.originStop?.name} → {trip.route?.destinationStop?.name}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Date & Time</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(trip.departureTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Duration</p>
              <p className="text-gray-900 dark:text-white font-medium">{trip.durationMinutes} minutes</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Price per seat</p>
              <p className="text-gray-900 dark:text-white font-medium">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Your Seats</h2>
                <div className="flex items-center gap-2 text-green-600">
                  <Radio className="w-4 h-4" />
                  <span className="text-sm">Live updates enabled</span>
                </div>
              </div>

              {/* Bus Layout */}
              <div className="max-w-md mx-auto">
                {/* Driver */}
                <div className="flex justify-end mb-6 pb-4 border-b-2 border-gray-300 dark:border-gray-700">
                  <div className="bg-gray-700 dark:bg-gray-600 text-white px-6 py-2 rounded-t-lg text-sm font-medium">
                    Driver
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="space-y-3">
                  {Object.keys(seatRows)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((rowNum) => {
                      const row = seatRows[Number(rowNum)]

                      return (
                        <div key={rowNum} className="flex items-center justify-center gap-3">
                          {/* Left seats */}
                          <div className="flex gap-2">
                            {row.slice(0, layoutPattern.left).map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat.id)}
                                disabled={seat.status === 'booked' || seat.status === 'locked'}
                                className={`${getSeatColor(
                                  seat.status
                                )} text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 min-w-[60px]`}
                              >
                                {seat.code}
                              </button>
                            ))}
                          </div>

                          {/* Aisle */}
                          <div className="w-8 shrink-0" />

                          {/* Middle seats (for sleeper buses) */}
                          {layoutPattern.hasMiddle && layoutPattern.middle && (
                            <>
                              <div className="flex gap-2">
                                {row.slice(layoutPattern.left, layoutPattern.left + layoutPattern.middle).map((seat) => (
                                  <button
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat.id)}
                                    disabled={seat.status === 'booked' || seat.status === 'locked'}
                                    className={`${getSeatColor(
                                      seat.status
                                    )} text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 min-w-[60px]`}
                                  >
                                    {seat.code}
                                  </button>
                                ))}
                              </div>
                              <div className="w-8 shrink-0" />
                            </>
                          )}

                          {/* Right seats */}
                          <div className="flex gap-2">
                            {row.slice(layoutPattern.hasMiddle && layoutPattern.middle 
                              ? layoutPattern.left + layoutPattern.middle 
                              : layoutPattern.left
                            ).map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat.id)}
                                disabled={seat.status === 'booked' || seat.status === 'locked'}
                                className={`${getSeatColor(
                                  seat.status
                                )} text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 min-w-[60px]`}
                              >
                                {seat.code}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Passengers</p>
                  <p className="text-gray-900 dark:text-white font-medium">{passengers} {passengers === 1 ? 'person' : 'people'}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Selected Seats ({selectedSeats.length}/{passengers})</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedSeats.length > 0
                      ? seats
                          .filter((s) => selectedSeats.includes(s.id))
                          .map((s) => s.code)
                          .join(', ')
                      : 'None'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 dark:text-gray-400">Total Price</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
