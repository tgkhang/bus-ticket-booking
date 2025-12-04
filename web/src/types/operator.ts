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