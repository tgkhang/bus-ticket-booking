import authorizedAxiosInstance from '@/lib/axios/authorizeAxios';
import { API_ROOT } from '@/lib/utils/constants';

export async function fetchBookingAnalytics(from: string, to: string) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/analytics/bookings`, { params: { from, to } });
  return response.data;
}