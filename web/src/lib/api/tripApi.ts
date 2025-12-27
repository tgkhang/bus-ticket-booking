import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'
import type { PaginationParams, PaginatedResponse } from '@/types/api'
import type { TripDetail, CreateTripData, UpdateTripData, ListTripsFilters, Trip } from '@/types/trip'
import { toast } from 'sonner'

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

export const updateTripAPI = async (tripId: string, tripData: Partial<UpdateTripData>) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/trips/${tripId}`, tripData)
  toast.success('Trip updated successfully')
  return response.data
}

export const deleteTripAPI = async (tripId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/trips/${tripId}`)
  toast.success('Trip deleted successfully')
  return response.data
}
