import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'

export type AdminBookingListParams = {
  status?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export async function listAdminBookings(params?: AdminBookingListParams) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/admin/bookings`, { params })
  return response.data
}

export async function getAdminBookingById(id: string) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/admin/bookings/${id}`)
  return response.data
}

export async function confirmAdminBooking(id: string) {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/admin/bookings/${id}/confirm`)
  return response.data
}

export async function cancelAdminBooking(id: string) {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/admin/bookings/${id}/cancel`)
  return response.data
}
