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

const listStops = async () => {
  return await stopModel.findMany({})
}

// Routes CRUD
const createRoute = async (payload) => {
  await ensureOperatorExists(payload.operatorId)
  await ensureStopsExist([payload.originStopId, payload.destinationStopId])
  if (payload.stops?.length) {
    await ensureStopsExist(payload.stops.map((s) => s.stopId))
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

const listRoutes = async () => {
  return await routeModel.findMany({})
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
