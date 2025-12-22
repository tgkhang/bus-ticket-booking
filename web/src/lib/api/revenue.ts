import authorizedAxiosInstance from '@/lib/axios/authorizeAxios';
import { API_ROOT } from '@/lib/utils/constants';

export async function fetchRevenueOverview(from: string, to: string) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/revenue/overview`, { params: { from, to } });
  return response.data;
}

export async function fetchRevenueByRoute(from: string, to: string) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/revenue/by-route`, { params: { from, to } });
  return response.data;
}

export async function fetchRevenueByPaymentMethod(from: string, to: string) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/revenue/payment-method`, { params: { from, to } });
  return response.data;
}
