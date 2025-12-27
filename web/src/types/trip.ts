// Trip types for the bus ticket booking system

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

export type SeatStatus = 'available' | 'locked' | 'booked'

export type SeatType = 'regular' | 'premium' | 'sleeper'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Seat {
  id: string
  seatNumber: string
  seatType: SeatType
  status: SeatStatus
  passengerName?: string
  bookingId?: string
}

export interface Passenger {
  id: string
  name: string
  email: string
  phone: string
  seatNumber: string
  bookingRef: string
}

export interface TripBooking {
  id: string
  bookingRef: string
  userName: string
  userEmail: string
  status: BookingStatus
  totalAmount: number
  bookedAt: string
  passengerCount: number
}

// Basic Trip structure returned by List Trips API
export interface Trip {
  id: string
  routeId: string
  routeName?: string
  busId: string
  busModel?: string
  busPlateNumber?: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  status: TripStatus
  durationMinutes?: number
  availableSeats?: number
  seatsBooked?: number
  totalSeats?: number
  originStop?: string
  destinationStop?: string
  operatorName?: string
  createdAt?: string
  updatedAt?: string
}

// Detailed Trip structure returned by Get Trip by ID API
export interface TripDetail {
  id: string
  routeId: string
  busId: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  status: TripStatus
  staffId?: string | null
  createdAt?: string
  updatedAt?: string

  // Staff information
  staff?: {
    id: string
    user?: {
      id: string
      displayName?: string
      email?: string
      phoneNumber?: string
      avatar?: string
    }
  }

  // Nested route information
  route?: {
    id: string
    name: string
    originStopId?: string
    destinationStopId?: string
    distanceKm?: number
    stops?: Array<{
      id?: string
      stopId: string
      stopName?: string
      stopAddress?: string
      sequence?: number
      distanceFromOrigin?: number
      estimatedMinutes?: number
      isPickup?: boolean
      isDropoff?: boolean
      note?: string | null
      // Nested stop object from API
      stop?: {
        id: string
        name: string
        address: string
        latitude?: number
        longitude?: number
      }
    }>
  }

  // Nested bus information
  bus?: {
    id: string
    model: string
    plateNumber: string
    capacity?: number
    seatCapacity?: number
    busType?: string
    amenities?: string[] | Record<string, boolean>
    images?: string[] // Array of image URLs
    operatorId?: string
    operator?: {
      id: string
      name: string
      contactEmail?: string
      contactPhone?: string
    }
  }

  // Nested operator information
  operator?: {
    id: string
    name: string
    phone?: string
    email?: string
  }

  // Seat information for this trip
  seats?: Seat[]

  // Booking information
  bookings?: TripBooking[]

  // Passenger information
  passengers?: Passenger[]
}

export interface CreateTripData {
  routeId: string
  busId: string
  departureTime: string
  arrivalTime: string
  basePrice: number
  status?: TripStatus
}

export interface UpdateTripData {
  routeId?: string
  busId?: string
  departureTime?: string
  arrivalTime?: string
  basePrice?: number
  status?: TripStatus
  staffId?: string | null
}

export interface ListTripsFilters {
  status?: TripStatus
  routeId?: string
  busId?: string
  departureTime?: string
  arrivalTime?: string
  basePrice?: number
  search?: string
  staffId?: string
  operatorId?: string
}

export interface SearchTripsFilters {
  originStopId?: string
  destinationStopId?: string
  date?: string
  timeFrom?: string
  timeTo?: string
  startTime?: string
  endTime?: string
  minPrice?: number
  maxPrice?: number
  busModel?: string
  amenities?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}
