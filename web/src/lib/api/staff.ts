import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'

export const getMyTrips = async (filters?: { status?: string; date?: string }) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/staff/trips`, { params: filters })
  return response.data
}

export const getStaffByOperatorAPI = async (operatorId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/staff/by-operator/${operatorId}`)
  return response.data
}

// Get passengers for a specific trip
export const getTripPassengers = async (tripId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/staff/trips/${tripId}/passengers`)
  return response.data
}

// Mark passenger as boarded
export const markPassengerBoarded = async (passengerId: string) => {
  const response = await authorizedAxiosInstance.patch(`${API_ROOT}/v1/staff/passengers/${passengerId}/board`)
  return response.data
}

// Update trip status (departed/arrived)
export const updateTripStatus = async (
  tripId: string,
  status: 'departed' | 'arrived' | 'scheduled' | 'completed' | 'cancelled'
) => {
  const response = await authorizedAxiosInstance.patch(`${API_ROOT}/v1/staff/trips/${tripId}/status`, { status })
  return response.data
}
