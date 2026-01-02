export interface Stop {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface RouteStop {
  id: string
  stopId: string
  routeId: string
  sequence: number
  isPickup: boolean
  isDropoff: boolean
  note?: string | null
}

// API Response type - includes nested objects
export interface Route {
  id: string
  name: string
  operatorId: string
  operator: {
    id: string
    name: string
    contactEmail: string
    contactPhone: string
    status: string
    approvedAt: string
    createdAt: string
    updatedAt: string
  }
  originStopId: string
  originStop: Stop & {
    createdAt: string
    updatedAt: string
  }
  destinationStopId: string
  destinationStop: Stop & {
    createdAt: string
    updatedAt: string
  }
  distanceKm: number
  estimatedMinutes: number
  active: boolean
  stops: (RouteStop & {
    stop: Stop
    createdAt: string
    updatedAt: string
  })[]
  createdAt: string
  updatedAt: string
}

// Types for creating/updating routes
export interface CreateRouteData {
  name: string
  operatorId: string
  originStopId: string
  destinationStopId: string
  distanceKm: number
  estimatedMinutes: number
  active?: boolean
  stops?: {
    stopId: string
    sequence: number
    isPickup: boolean
    isDropoff: boolean
    note?: string
  }[]
}

export interface UpdateRouteData {
  name?: string
  operatorId?: string
  originStopId?: string
  destinationStopId?: string
  distanceKm?: number
  estimatedMinutes?: number
  active?: boolean
  stops?: {
    stopId: string
    sequence: number
    isPickup: boolean
    isDropoff: boolean
    note?: string
  }[]
}