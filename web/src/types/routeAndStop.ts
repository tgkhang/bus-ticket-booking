export interface Stop {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  active: boolean
}

export interface RouteStop {
  id: string
  stopId: string
  routeId: string
  stopName: string
  sequence: number
  isPickup: boolean
  isDropoff: boolean
  note?: string
}

export interface Route {
  id: string
  name: string
  operatorId: string
  operatorName: string //
  originStopId: string
  originStopName: string //
  destinationStopId: string
  destinationStopName: string //
  distanceKm: number
  estimatedMinutes: number
  active: boolean
  stops: RouteStop[]
}
