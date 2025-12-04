// =================================
// Operator Types
// =================================

export interface Operator {
  id: string
  name: string
  contactEmail: string
  contactPhone?: string
  status: 'pending' | 'approved' | 'suspended'
  approvedAt?: string
  createdAt?: string
  updatedAt?: string
  buses?: Array<{
    id: string
    operatorId: string
    plateNumber: string
    model: string
    seatCapacity: number
    status: string
    amenities?: any
    createdAt?: string
    updatedAt?: string
  }>
  routes?: Array<{
    id: string
    name: string
    operatorId: string
    originStopId: string
    destinationStopId: string
    distanceKm?: number
    estimatedMinutes?: number
    active: boolean
    createdAt?: string
    updatedAt?: string
  }>
}

export interface CreateOperatorData {
  name: string
  contactEmail: string
  contactPhone?: string
  status?: 'pending' | 'approved' | 'suspended'
}

export interface UpdateOperatorData {
  name?: string
  contactEmail?: string
  contactPhone?: string
  status?: 'pending' | 'approved' | 'suspended'
}

export interface ListOperatorsFilters {
  status?: 'pending' | 'approved' | 'suspended'
  search?: string
}