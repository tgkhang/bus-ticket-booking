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
  bookingId?: string
}) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/payments/create-payment-link`, paymentData)
  return response.data
}

export const getPaymentLinkInfoAPI = async (orderCode: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/payments/${orderCode}`)
  return response.data
}
