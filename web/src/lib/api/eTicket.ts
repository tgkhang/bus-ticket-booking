import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'

export const downloadETicketAPI = async (bookingId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/bookings/${bookingId}/e-ticket`, {
    responseType: 'blob',
  })
  return response.data
}

export const sendETicketEmailAPI = async (bookingId: string) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/bookings/${bookingId}/e-ticket/email`)
  return response.data
}
