/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Bus, BusAmenities, Operator } from '@/types/api'

// Transform snake_case bus response from backend to camelCase for frontend
export const transformBusFromAPI = (data: any): Bus => {
  return {
    id: data.id,
    operatorId: data.operator_id,
    plateNumber: data.plate_number,
    model: data.model,
    seatCapacity: data.seat_capacity,
    amenities: data.amenities as BusAmenities,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Transform array of buses from API
export const transformBusesFromAPI = (data: any[]): Bus[] => {
  return data.map(transformBusFromAPI)
}

// Transform camelCase bus data to snake_case for API
export const transformBusForAPI = (data: any) => {
  return {
    operator_id: data.operatorId,
    plate_number: data.plateNumber,
    model: data.model,
    seat_capacity: data.seatCapacity,
    amenities: data.amenities,
    status: data.status,
  }
}

// Transform snake_case operator response from backend to camelCase for frontend
export const transformOperatorFromAPI = (data: any): Operator => {
  return {
    id: data.id,
    name: data.name,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    status: data.status,
    approved_at: data.approved_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Transform array of operators from API
export const transformOperatorsFromAPI = (data: any[]): Operator[] => {
  return data.map(transformOperatorFromAPI)
}
