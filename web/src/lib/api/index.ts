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
import type { Operator,ListOperatorsFilters } from '@/types/operator'
import { CreateRouteData, Route, Stop } from '@/types/routeAndStop'
import type { Trip, TripDetail, CreateTripData, UpdateTripData, ListTripsFilters, SearchTripsFilters } from '@/types/trip'
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
export const autocompleteStopsAPI = async (query: string, limit: number = 10) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/stops/autocomplete`, {
    params: { q: query, limit },
  })
  return response.data
}

// Trips API
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

export const getTripByIdAPI = async (id: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/trips/${id}`)
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

// // Update bus
// Router.put(
//   '/:id',
//   authMiddleware.isAuthorized,
//   rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
//   busValidation.updateBus,
//   busController.updateBus
// )

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

export const listTripsAPI = async (
  filters?: ListTripsFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Trip>> => {
  const params = {
    ...filters,
    ...pagination,
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/trips`, { params })
  return response.data
}

export const getTripDetailsAPI = async (tripId: string): Promise<TripDetail> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/trips/${tripId}`)
  return response.data
}

export const createTripAPI = async (tripData: CreateTripData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/trips`, tripData)
  toast.success('Trip created successfully')
  return response.data
}

export const updateTripAPI = async (tripId: string, tripData: UpdateTripData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/trips/${tripId}`, tripData)
  toast.success('Trip updated successfully')
  return response.data
}

export const deleteTripAPI = async (tripId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/trips/${tripId}`)
  toast.success('Trip deleted successfully')
  return response.data
}

//=================================
// Booking API Calls
//=================================

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

export const getUserBookingsAPI = async (params?: {
  status?: string
  page?: number
  limit?: number
}) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/bookings`, { params })
  return response.data
}

export const confirmBookingAPI = async (bookingId: string, paymentData: {
  provider?: string
  transactionRef?: string
}) => {
  const response = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/bookings/${bookingId}/confirm`,
    paymentData
  )
  toast.success('Booking confirmed successfully!')
  return response.data
}

export const cancelBookingAPI = async (bookingId: string) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/bookings/${bookingId}/cancel`)
  toast.success('Booking cancelled successfully')
  return response.data
}
