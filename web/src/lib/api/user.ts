import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'

// User API endpoints

export async function fetchUsers(params?: { search?: string; role?: string; page?: number; limit?: number }) {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users`, { params })
  return response.data
}


export async function createUser(data: {
  username: string
  displayName: string
  email: string
  password: string
  role: string
  isActive: boolean
  operatorId?: string
}) {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users`, data)
  return response.data
}


export async function updateUser(id: string, data: {
  username?: string
  displayName?: string
  email?: string
  password?: string
  role?: string
  isActive?: boolean
}) {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/${id}`, data)
  return response.data
}

export async function toggleUserStatus(id: string, active: boolean) {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/${id}`, {
    isActive: active
  })
  return response.data
}

export async function deleteUser(id: string) {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/${id}`)
  return response.data
}
