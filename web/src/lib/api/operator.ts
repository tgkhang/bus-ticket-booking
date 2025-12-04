import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'
import type { CreateOperatorData, UpdateOperatorData } from '@/types/operator'

export async function fetchOperators(params?: { 
  search?: string
  status?: 'pending' | 'approved' | 'suspended'
  page?: number
  limit?: number 
}) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/operators`, { params })
  return response.data
}

export async function createOperator(data: CreateOperatorData) {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/operators`, data)
  return response.data
}

export async function updateOperator(id: string, data: UpdateOperatorData) {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/operators/${id}`, data)
  return response.data
}

export async function deleteOperator(id: string) {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/operators/${id}`)
  return response.data
}

export async function approveOperator(id: string) {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/operators/${id}/approve`)
  return response.data
}

export async function suspendOperator(id: string) {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/operators/${id}/suspend`)
  return response.data
}
