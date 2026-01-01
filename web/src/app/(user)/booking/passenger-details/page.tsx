'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getMeAPI, getTripByIdAPI, getSeatStatusesAPI } from '@/lib/api'
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [registeredEmail, setRegisteredEmail] = useState<string>('')
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
  })

  const normalizePhone = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return ''

    const hasPlus = trimmed.startsWith('+')
    const digits = trimmed.replace(/[^\d]/g, '')
    if (!digits) return ''

    return `${hasPlus ? '+' : ''}${digits}`
  }

  const isValidEmail = (raw: string) => {
    const email = raw.trim()
    // Stricter (and more explicit) email rule:
    // - no spaces
    // - must include a domain with at least one dot
    // - allows common local-part characters like + . _ -
    // Note: intentionally does not support quoted local-parts.
    return /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+$/i.test(email)
  }

  const isValidPhone = (raw: string) => {
    const phone = normalizePhone(raw)
    // Enforced phone rule:
    // - allow optional leading +
    // - digits only after normalization
    // - 8 to 15 digits (E.164-like length constraint, but allows local leading 0)
    return /^\+?\d{8,15}$/.test(phone)
  }

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await getMeAPI()
        const email = typeof me?.email === 'string' ? me.email : ''
        if (!email) return

        setRegisteredEmail(email)
        setContactInfo((prev) => ({
          ...prev,
          email: prev.email || email,
        }))
      } catch {
        // Not logged in (or token expired). Leave email editable.
      }
    }

    fetchMe()
  }, [])

  useEffect(() => {
    const fetchTripData = async () => {
      if (!tripId || !seatsParam) {
        toast.error('Invalid booking data')
        setLoading(false)
        return
      }

      try {
        const [tripData, seatStatusData] = await Promise.all([
          getTripByIdAPI(tripId),
          getSeatStatusesAPI(tripId),
        ])

        // Backend returns trip directly (not wrapped in { data: ... })
        setTrip(tripData)

        // Map seat IDs to seat codes
        const seatIds = seatsParam.split(',')
        const seatMap = new Map(
          seatStatusData.map((ss: any) => [ss.seatId, ss.seatCode])
        )

        setPassengers(
          seatIds.map((seatId, index) => ({
            id: index + 1,
            seatCode: String(seatMap.get(seatId) || seatId), // Ensure string type
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

    if (!isValidEmail(contactInfo.email)) {
      toast.error('Please enter a valid email address (e.g. name@example.com)')
      return
    }

    if (!isValidPhone(contactInfo.phone)) {
      toast.error('Please enter a valid phone number (8–15 digits, optional +)')
      return
    }

    const normalizedContactInfo = {
      ...contactInfo,
      email: contactInfo.email.trim(),
      phone: normalizePhone(contactInfo.phone),
    }

    // Encode data and navigate to checkout
    const bookingData = {
      tripId,
      seats: seatsParam,
      totalPrice,
      passengers,
      contactInfo: normalizedContactInfo,
    }

    router.push(
      `/booking/checkout?data=${encodeURIComponent(JSON.stringify(bookingData))}`
    )
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

  if (!trip || !tripId || !seatsParam) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Invalid booking data. Please start over.</p>
            <Button onClick={() => router.push('/homepage')} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            router.push(`/booking/seats/${tripId}?lockedSeats=${seatsParam}&passengers=${passengersCount}`)
          }}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
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
                <span className="text-gray-900 dark:text-white font-medium">Search</span>
              </div>
              <div className="w-16 h-0.5 bg-green-500"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                  2
                </div>
                <span className="text-gray-900 dark:text-white font-medium">Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium">
                  3
                </div>
                <span className="text-gray-600 dark:text-gray-300">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleContinue}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Passenger Details Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Passenger Details</h2>

                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div
                      key={passenger.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Passenger {index + 1}
                        </h3>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                          Seat: {passenger.seatCode}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.fullName}
                            onChange={(e) =>
                              handlePassengerChange(index, 'fullName', e.target.value)
                            }
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-600"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ID/Passport Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.documentId}
                            onChange={(e) =>
                              handlePassengerChange(index, 'documentId', e.target.value)
                            }
                            placeholder="Enter ID or passport number"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-600"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Information */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, email: e.target.value })
                        }
                        onBlur={(e) => {
                          const next = e.target.value.trim()
                          if (next !== e.target.value) {
                            setContactInfo((prev) => ({ ...prev, email: next }))
                          }
                        }}
                        readOnly={Boolean(registeredEmail)}
                        placeholder="your@email.com"
                        inputMode="email"
                        autoComplete="email"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        onBlur={(e) => {
                          const next = normalizePhone(e.target.value)
                          if (next !== e.target.value) {
                            setContactInfo((prev) => ({ ...prev, phone: next }))
                          }
                        }}
                        placeholder="+84 123 456 789"
                        inputMode="tel"
                        autoComplete="tel"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Route</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {trip.route?.originStop?.name} → {trip.route?.destinationStop?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Departure</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(trip.departureTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Selected Seats</p>
                    <p className="text-gray-900 dark:text-white font-medium">{seatsParam?.split(',').length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Passengers</p>
                    <p className="text-gray-900 dark:text-white font-medium">{passengersCount}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
                    onClick={() => router.push(`/booking/seats/${tripId}?lockedSeats=${seatsParam}&passengers=${passengersCount}`)}
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
        <div className="bg-gray-50 dark:bg-gray-900">
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
