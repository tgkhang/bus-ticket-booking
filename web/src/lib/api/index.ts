import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'
import type {
  RegisterUserData,
  VerifyAccountData,
  ResetPasswordData,
  OAuthGoogleData,
  CreateBusData,
  UpdateBusData,
  Bus,
  ListBusesFilters,
  SearchBusesFilters,
  PaginationParams,
  PaginatedResponse,
  ListStopsFilters,
  ListRoutesFilters,
} from '@/types/api'
import type { Operator, ListOperatorsFilters } from '@/types/operator'
import { CreateRouteData, Route, Stop } from '@/types/routeAndStop'
import { toast } from 'sonner'

//=================================
// User Authentication API Calls
//=================================

export const registerUserAPI = async (userData: RegisterUserData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, userData)
  return response.data
}

export const verifyUserAccountAPI = async (data: VerifyAccountData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify_account`, data)
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

export const logoutAllDevicesAPI = async () => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout_all`)
  return response.data
}

export const forgotPasswordAPI = async (email: string) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/forgot_password`, { email })
  return response.data
}

export const resetPasswordAPI = async (data: ResetPasswordData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/reset_password`, data)
  return response.data
}

export const getMeAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/me`)
  return response.data
}

export const oauthGoogleLoginAPI = async (userData: OAuthGoogleData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/oauth/google`, userData)
  return response.data
}

// Stops API
export const autocompleteStopsAPI = async (query: string, limit: number = 10, page: number = 1) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/stops/autocomplete`, {
    params: { q: query, limit, page },
  })
  return response.data
}

//=================================
// Bus API Calls
//=================================

export const createBusAPI = async (busData: CreateBusData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/buses`, busData)
  toast.success('Bus created successfully')
  return response.data
}

export const listBusesAPI = async (
  filters?: ListBusesFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Bus>> => {
  const params = {
    ...filters,
    ...pagination,
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/buses`, { params })
  return response.data
}

export const getBusDetailsAPI = async (busId: string): Promise<Bus> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/buses/${busId}`)
  return response.data
}

export const deleteBusAPI = async (busId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/buses/${busId}`)
  toast.success('Bus deleted successfully')
  return response.data
}

export const searchBusesAPI = async (filters: SearchBusesFilters): Promise<Bus[]> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/buses/search`, {
    params: filters,
  })
  return response.data
}

export const updateBusAPI = async (busId: string, busData: UpdateBusData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/buses/${busId}`, busData)
  return response.data
}

export const deleteAllSeatsAPI = async (busId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/buses/${busId}/allSeats`)
  toast.success('All seats deleted successfully')
  return response.data
}

export const deleteSeatAPI = async (busId: string, seatId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/buses/${busId}/seats/${seatId}`)
  toast.success('Seat deleted successfully')
  return response.data
}

export const createSeatAPI = async (
  busId: string,
  seatData: {
    seatNumber: string
    seatType: 'regular' | 'premium' | 'sleeper'
    isActive: boolean
  }
) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/buses/${busId}/seats`, {
    seats: [seatData],
  })
  toast.success('Seat created successfully')
  return response.data
}

export const generateSeatsAPI = async (
  busId: string,
  layoutData: {
    layout: string
    rows: number
    seatType: 'regular' | 'premium' | 'sleeper'
    startRow: number
  }
) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/buses/${busId}/seats/generate`, layoutData)
  toast.success('Seats generated successfully')
  return response.data
}

//=================================
// Stops API Calls
//=================================

export const listStopsAPI = async (
  filters?: ListStopsFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Stop>> => {
  const params = {
    ...filters,
    ...pagination,
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/stops`, { params })
  return response.data
}

//=================================
// Operator API Calls
//=================================

export const listOperatorsAPI = async (
  filters?: ListOperatorsFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Operator>> => {
  const params = {
    ...filters,
    ...pagination,
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/operators`, { params })
  return response.data
}

export const getOperatorDetailsAPI = async (operatorId: string): Promise<Operator> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/operators/${operatorId}`)
  return response.data
}

//=================================
// Route API Calls
//=================================

export const listRoutesAPI = async (
  filters?: ListRoutesFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Route>> => {
  const params = {
    ...filters,
    ...pagination,
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/routes`, { params })
  return response.data
}

export const deleteRouteAPI = async (routeId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/routes/${routeId}`)
  // toast.success('Route deleted successfully')
  return response.data
}

export const createRouteAPI = async (routeData: CreateRouteData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/routes`, routeData)
  toast.success('Route created successfully')
  return response.data
}

export const updateRouteAPI = async (routeId: string, routeData: CreateRouteData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/routes/${routeId}`, routeData)
  toast.success('Route updated successfully')
  return response.data
}

export const getRouteDetailsAPI = async (routeId: string): Promise<Route> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/routes/${routeId}`)
  return response.data
}

//=================================
// Trip API Calls
//=================================

// Re-export trip APIs from tripApi.ts
export { listTripsAPI, getTripDetailsAPI, createTripAPI, updateTripAPI, deleteTripAPI } from './tripApi'

export const searchTripsAPI = async (params: {
  originStopId?: string
  destinationStopId?: string
  date?: string
  passengers?: number
  startTime?: string
  endTime?: string
  minPrice?: number
  maxPrice?: number
  busModel?: string
  amenities?: string
  status?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  limit?: number
}) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/trips/search`, { params })
  return response.data
}

//=================================
// Booking API Calls
//=================================

export const getTripByIdAPI = async (tripId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/trips/${tripId}`)
  return response.data
}

export const getSeatStatusesAPI = async (tripId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/trips/${tripId}/seats`)
  return response.data
}

export const lockSeatsAPI = async (tripId: string, seatIds: string[], lockDuration: number = 10) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/bookings/lock-seats`, {
    tripId,
    seatIds,
    lockDuration,
  })
  return response.data
}

export const createBookingAPI = async (bookingData: {
  tripId: string
  seatIds: string[]
  passengers: Array<{
    fullName: string
    documentId: string
    seatCode: string
  }>
  totalAmount: number
}) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/bookings`, bookingData)
  return response.data
}

export const getBookingByIdAPI = async (bookingId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/bookings/${bookingId}`)
  return response.data
}

export const getUserBookingsAPI = async (params?: { status?: string; page?: number; limit?: number }) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/bookings`, { params })
  return response.data
}

export const confirmBookingAPI = async (
  bookingId: string,
  paymentData: {
    provider?: string
    transactionRef?: string
  }
) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/bookings/${bookingId}/confirm`, paymentData)
  toast.success('Booking confirmed successfully!')
  return response.data
}

export const cancelBookingAPI = async (bookingId: string) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/bookings/${bookingId}/cancel`)
  toast.success('Booking cancelled successfully')
  return response.data
}
