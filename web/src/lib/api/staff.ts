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
export const getTripPassengers = async (tripId: string) => {}

// Mark passenger as boarded
export const markPassengerBoarded = async (passengerId: string) => {}

// Update trip status (departed/arrived)
export const updateTripStatus = async (
  tripId: string,
  status: 'departed' | 'arrived' | 'scheduled' | 'completed' | 'cancelled'
) => {}
