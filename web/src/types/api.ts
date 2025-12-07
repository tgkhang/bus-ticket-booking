// =================================
// User Types
// =================================

export interface RegisterUserData {
  email: string
  password: string
  username: string
}

export interface VerifyAccountData {
  email: string
  token: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
}

export interface OAuthGoogleData {
  email: string
  name: string
  picture?: string
  sub: string
}

// =================================
// Bus Types
// =================================

export interface BusAmenities {
  wifi?: boolean
  ac?: boolean
  restroom?: boolean
  entertainment?: boolean
  usb_charging?: boolean
  reclining_seats?: boolean
  reading_light?: boolean
  blanket?: boolean
  water?: boolean
}

export interface CreateBusData {
  operatorId: string
  plateNumber: string // Format: Uppercase letters, numbers, and hyphens (5-20 chars)
  model: string // 2-100 characters
  seatCapacity: number // 1-100 seats
  amenities?: BusAmenities
}

export interface UpdateBusData {
  plateNumber?: string
  model?: string
  seatCapacity?: number
  amenities?: BusAmenities
  status?: 'active' | 'inactive' | 'maintenance'
}

export interface Seat {
  id: string
  busId: string
  seatNumber: string
  seatType: 'regular' | 'premium' | 'sleeper'
  isActive: boolean
}

export interface Bus {
  id: string
  operatorId: string
  plateNumber: string
  model: string
  seatCapacity: number
  amenities: BusAmenities
  status: 'active' | 'inactive' | 'maintenance'
  seats: Seat[]
  createdAt: string
  updatedAt: string
  operator?: {
    id: string
    name: string
    contactEmail: string
    contactPhone?: string
    status: string
    approvedAt?: string
  }
  seats?: Array<{
    id: string
    seatNumber: string
    seatType: string
    isActive: boolean
  }>
}

// =================================
// API Query & Response Types
// =================================

export interface ListBusesFilters {
  operatorId?: string
  plateNumber?: string
  minCapacity?: number
  search?: string
}

export interface SearchBusesFilters {
  originStopId?: string
  destinationStopId?: string
  date?: string
  seatType?: string
  minSeats?: number
  amenities?: string // e.g., "wifi,ac"
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ListStopsFilters {
  name?: string
  address?: string
  active?: boolean
  search?: string
}

export interface ListRoutesFilters {
  operatorId?: string
  name?: string
  originStopId?: string
  destinationStopId?: string
  active?: boolean
  estimatedMinutes?: number
  search?: string
}
