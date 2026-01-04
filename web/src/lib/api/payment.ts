import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'

export const createPaymentLinkAPI = async (paymentData: {
  amount: number
  description?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
  bookingId: string
}) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/payments/create-payment-link`, paymentData)
  return response.data
}

export const createPaymentLinkPublicAPI = async (paymentData: {
  bookingId: string
  referenceCode: string
  token: string
  description?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/payments/create-payment-link-public`, paymentData)
  return response.data
}

export const getPaymentLinkInfoAPI = async (orderCode: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/payments/${orderCode}`)
  return response.data
}

// Manually confirm booking after payment for local testing without webhook (dev)
export const devConfirmBookingAPI = async (bookingId: string, orderCode: string) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/payments/dev-confirm-booking`, {
    bookingId,
    orderCode,
  })
  return response.data
}
