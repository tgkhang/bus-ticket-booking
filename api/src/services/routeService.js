import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { routeModel } from '~/models/routeModel'
import { stopModel } from '~/models/stopModel'
import { GET_DB } from '~/config/prisma'

// Pass-through camelCase payload used by Prisma (fields mapped in schema)
const mapRoutePayload = (payload) => ({
  name: payload.name,
  operatorId: payload.operatorId,
  originStopId: payload.originStopId,
  destinationStopId: payload.destinationStopId,
  distanceKm: payload.distanceKm,
  estimatedMinutes: payload.estimatedMinutes,
  active: payload.active,
})

const ensureStopsExist = async (stopIds, allowNull = false) => {
  if (!stopIds || !stopIds.length) return
  const results = await Promise.all(stopIds.map((id) => stopModel.findById(id)))
  if (results.some((s) => !s)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more referenced stops do not exist')
  }
}

const ensureOperatorExists = async (operatorId) => {
  const prisma = GET_DB()
  const op = await prisma.operator.findUnique({ where: { id: operatorId } })
  if (!op) throw new ApiError(StatusCodes.BAD_REQUEST, 'Operator not found')
  return op
}

// Stops CRUD
const createStop = async (payload) => {
  return await stopModel.createStop(payload)
}

const updateStop = async (id, payload) => {
  const existing = await stopModel.findById(id)
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Stop not found')
  return await stopModel.updateStop(id, payload)
}

const deleteStop = async (id) => {
  // Integrity check: ensure stop not used as origin/destination or in routeStops
  const usedStopIds = await routeModel.findUsedStopIds(id)
  if (usedStopIds) throw new ApiError(StatusCodes.CONFLICT, 'Stop is referenced by at least one route')
  await stopModel.deleteStop(id)
  return { deleted: true }
}

const getStop = async (id) => {
  const stop = await stopModel.findById(id)
  if (!stop) throw new ApiError(StatusCodes.NOT_FOUND, 'Stop not found')
  return stop
}

const listStops = async (filters, pagination) => {
  // if (userRole === 'operator' && userOperatorId) {
  //   filters.operatorId = userOperatorId
  // }
  return await stopModel.getStops(filters, pagination)
}

// Routes CRUD
const createRoute = async (payload) => {
  // Validate operator exists
  await ensureOperatorExists(payload.operatorId)

  // Validate origin and destination stops exist
  await ensureStopsExist([payload.originStopId, payload.destinationStopId])

  // Validate all stops in the stops array exist
  if (payload.stops?.length) {
    const stopIds = payload.stops.map((s) => s.stopId)
    await ensureStopsExist(stopIds)

    // Additional business logic: Check if origin and destination are in the stops array
    const hasOrigin = stopIds.includes(payload.originStopId)
    const hasDestination = stopIds.includes(payload.destinationStopId)

    if (!hasOrigin || !hasDestination) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Origin and destination stops must be included in the stops array'
      )
    }

    // Validate that stops are active
    const prisma = GET_DB()
    const stops = await prisma.stop.findMany({
      where: { id: { in: stopIds } },
      select: { id: true, active: true, name: true },
    })

    const inactiveStops = stops.filter((s) => !s.active)
    if (inactiveStops.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot create route with inactive stops: ${inactiveStops.map((s) => s.name).join(', ')}`
      )
    }
  }

  const mapped = mapRoutePayload(payload)
  return await routeModel.createRoute(mapped, payload.stops || [])
}

const updateRoute = async (id, payload) => {
  const existing = await routeModel.findById(id)
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Route not found')
  if (payload.operatorId) await ensureOperatorExists(payload.operatorId)
  const stopIdsToCheck = []
  if (payload.originStopId) stopIdsToCheck.push(payload.originStopId)
  if (payload.destinationStopId) stopIdsToCheck.push(payload.destinationStopId)
  if (stopIdsToCheck.length) await ensureStopsExist(stopIdsToCheck)
  if (Array.isArray(payload.stops)) await ensureStopsExist(payload.stops.map((s) => s.stopId))
  const mapped = mapRoutePayload(payload)
  return await routeModel.updateRoute(id, mapped, payload.stops)
}

const deleteRoute = async (id) => {
  const existing = await routeModel.findById(id)
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Route not found')
  await routeModel.deleteRoute(id)
  return { deleted: true }
}

const getRoute = async (id) => {
  const route = await routeModel.findById(id)
  if (!route) throw new ApiError(StatusCodes.NOT_FOUND, 'Route not found')
  return route
}

const listRoutes = async (filters, pagination) => {
  return await routeModel.getRoutes(filters, pagination)
}

export const routeService = {
  // Stops
  createStop,
  updateStop,
  deleteStop,
  getStop,
  listStops,
  // Routes
  createRoute,
  updateRoute,
  deleteRoute,
  getRoute,
  listRoutes,
}
