import authorizedAxiosInstance from '@/lib/axios/authorizeAxios'
import { API_ROOT } from '@/lib/utils/constants'
import type {
  RegisterUserData,
  VerifyAccountData,
  ResetPasswordData,
  OAuthGoogleData,
  CreateBusData,
  UpdateBusData,
  Bus,
  ListBusesFilters,
  SearchBusesFilters,
  PaginationParams,
  PaginatedResponse,
  Operator,
  ListOperatorsFilters,
} from '@/types/api'
import { toast } from 'sonner'
import {
  transformBusFromAPI,
  transformBusesFromAPI,
  transformBusForAPI,
  transformOperatorsFromAPI,
} from '@/lib/utils/transformers'

//=================================
// User Authentication API Calls
//=================================

export const registerUserAPI = async (userData: RegisterUserData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, userData)
  return response.data
}

export const verifyUserAccountAPI = async (data: VerifyAccountData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify_account`, data)
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

export const logoutAllDevicesAPI = async () => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout_all`)
  return response.data
}

export const forgotPasswordAPI = async (email: string) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/forgot_password`, { email })
  return response.data
}

export const resetPasswordAPI = async (data: ResetPasswordData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/reset_password`, data)
  return response.data
}

export const getMeAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/me`)
  return response.data
}

export const oauthGoogleLoginAPI = async (userData: OAuthGoogleData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/oauth/google`, userData)
  return response.data
}

//=================================
// Bus API Calls
//=================================

export const createBusAPI = async (busData: CreateBusData) => {
  const transformedData = transformBusForAPI(busData)
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/buses`, transformedData)
  toast.success('Bus created successfully')
  return transformBusFromAPI(response.data)
}

export const listBusesAPI = async (
  filters?: ListBusesFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Bus>> => {
  const params = {
    ...filters,
    ...pagination,
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/buses`, { params })
  return {
    data: transformBusesFromAPI(response.data.data),
    pagination: response.data.pagination,
  }
}

export const getBusDetailsAPI = async (busId: string): Promise<Bus> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/buses/${busId}`)
  return transformBusFromAPI(response.data)
}

export const deleteBusAPI = async (busId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/buses/${busId}`)
  toast.success('Bus deleted successfully')
  return response.data
}

export const searchBusesAPI = async (filters: SearchBusesFilters): Promise<Bus[]> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/buses/search`, {
    params: filters,
  })
  return transformBusesFromAPI(response.data)
}

export const updateBusAPI = async (busId: string, busData: UpdateBusData) => {
  const transformedData = transformBusForAPI(busData)
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/buses/${busId}`, transformedData)
  return transformBusFromAPI(response.data)
}

// // Update bus
// Router.put(
//   '/:id',
//   authMiddleware.isAuthorized,
//   rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
//   busValidation.updateBus,
//   busController.updateBus
// )

//=================================
// Operator API Calls
//=================================

export const listOperatorsAPI = async (
  filters?: ListOperatorsFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Operator>> => {
  const params = {
    ...filters,
    ...pagination,
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/operators`, { params })
  return {
    data: transformOperatorsFromAPI(response.data.data),
    pagination: response.data.pagination,
  }
}

export const getOperatorDetailsAPI = async (operatorId: string): Promise<Operator> => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/operators/${operatorId}`)
  return transformOperatorsFromAPI([response.data])[0]
}
