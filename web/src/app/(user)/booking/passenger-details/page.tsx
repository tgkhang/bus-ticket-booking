'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getTripByIdAPI } from '@/lib/api'
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { toast } from 'sonner'

interface Passenger {
  id: number
  seatCode: string
  fullName: string
  documentId: string
}

function PassengerDetailsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tripId = searchParams.get('tripId')
  const seatsParam = searchParams.get('seats')
  const totalPrice = Number(searchParams.get('totalPrice')) || 0
  const passengersCount = Number(searchParams.get('passengers')) || 1

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
  })

  useEffect(() => {
    const fetchTripData = async () => {
      if (!tripId || !seatsParam) {
        toast.error('Invalid booking data')
        setLoading(false)
        return
      }

      try {
        const tripData = await getTripByIdAPI(tripId)
        setTrip(tripData.data)

        // Initialize passengers array
        const seatCodes = seatsParam.split(',')
        setPassengers(
          seatCodes.map((seatId, index) => ({
            id: index + 1,
            seatCode: seatId, // This will be the seat ID; we'd need to map to code
            fullName: '',
            documentId: '',
          }))
        )
      } catch (err) {
        console.error('Failed to fetch trip:', err)
        toast.error('Failed to load trip information')
      } finally {
        setLoading(false)
      }
    }

    fetchTripData()
  }, [tripId, seatsParam])

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengers]
    updated[index] = { ...updated[index], [field]: value }
    setPassengers(updated)
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields are filled
    const allFilled =
      passengers.every((p) => p.fullName && p.documentId) && contactInfo.email && contactInfo.phone

    if (!allFilled) {
      toast.error('Please fill in all required fields')
      return
    }

    // Encode data and navigate to checkout
    const bookingData = {
      tripId,
      seats: seatsParam,
      totalPrice,
      passengers,
      contactInfo,
    }

    router.push(
      `/booking/checkout?data=${encodeURIComponent(JSON.stringify(bookingData))}`
    )
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

  if (!trip || !tripId || !seatsParam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Invalid booking data. Please start over.</p>
            <Button onClick={() => router.push('/homepage')} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
          Back to Seat Selection
        </button>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-gray-900 font-medium">Search</span>
              </div>
              <div className="w-16 h-0.5 bg-green-500"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                  2
                </div>
                <span className="text-gray-900 font-medium">Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-medium">
                  3
                </div>
                <span className="text-gray-600">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleContinue}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Passenger Details Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Passenger Details</h2>

                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div
                      key={passenger.id}
                      className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Passenger {index + 1}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Seat: {passenger.seatCode}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.fullName}
                            onChange={(e) =>
                              handlePassengerChange(index, 'fullName', e.target.value)
                            }
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID/Passport Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.documentId}
                            onChange={(e) =>
                              handlePassengerChange(index, 'documentId', e.target.value)
                            }
                            placeholder="Enter ID or passport number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Information */}
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        placeholder="+84 123 456 789"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-600 text-sm">Route</p>
                    <p className="text-gray-900 font-medium">
                      {trip.originStop?.name} → {trip.destinationStop?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Departure</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(trip.departureTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Selected Seats</p>
                    <p className="text-gray-900 font-medium">{seatsParam?.split(',').length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Passengers</p>
                    <p className="text-gray-900 font-medium">{passengersCount}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                    Continue to Payment
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PassengerDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        </div>
      }
    >
      <PassengerDetailsContent />
    </Suspense>
  )
}
