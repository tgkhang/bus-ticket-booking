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

const autocompleteStops = async (query, limit = 10, page = 1) => {
  try {
    if (!query || query.trim().length === 0) {
      // If no query, return all stops (paginated)
      const stops = await stopModel.searchStops('', limit, page)
      return stops.map((stop) => ({
        id: stop.id,
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
      }))
    }
    const stops = await stopModel.searchStops(query.trim(), limit, page)
    return stops.map((stop) => ({
      id: stop.id,
      name: stop.name,
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude,
    }))
  } catch (error) {
    throw error
  }
}

// Public fulltext search endpoints for browse/search page
const searchStopsPublic = async (query, limit = 10, page = 1) => {
  const q = typeof query === 'string' ? query.trim() : ''
  return await stopModel.fullTextSearchStops(q, limit, page)
}

const searchRoutesPublic = async (query, limit = 10, page = 1) => {
  const q = typeof query === 'string' ? query.trim() : ''
  return await routeModel.fullTextSearchRoutes(q, limit, page)
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

const getPopularRoutes = async (limit = 4) => {
  return await routeModel.getPopularRoutes(limit)
}

const bulkImportStops = async (stops) => {
  const results = {
    success: [],
    errors: [],
  }

  for (const [index, stopData] of stops.entries()) {
    try {
      // Validate required fields
      if (!stopData.name || stopData.latitude === undefined || stopData.longitude === undefined) {
        results.errors.push({
          index,
          data: stopData,
          error: 'Missing required fields: name, latitude, longitude',
        })
        continue
      }

      // Validate coordinate ranges
      if (stopData.latitude < -90 || stopData.latitude > 90) {
        results.errors.push({
          index,
          data: stopData,
          error: 'Latitude must be between -90 and 90',
        })
        continue
      }

      if (stopData.longitude < -180 || stopData.longitude > 180) {
        results.errors.push({
          index,
          data: stopData,
          error: 'Longitude must be between -180 and 180',
        })
        continue
      }

      const created = await stopModel.createStop({
        name: stopData.name,
        latitude: parseFloat(stopData.latitude),
        longitude: parseFloat(stopData.longitude),
        address: stopData.address || '',
        active: stopData.active !== undefined ? stopData.active : true,
      })

      results.success.push({ index, id: created.id, name: created.name })
    } catch (error) {
      results.errors.push({
        index,
        data: stopData,
        error: error.message || 'Failed to create stop',
      })
    }
  }

  return {
    total: stops.length,
    successCount: results.success.length,
    errorCount: results.errors.length,
    success: results.success,
    errors: results.errors,
  }
}

const exportStops = async (filters) => {
  // Get all stops without pagination for export
  const result = await stopModel.getStops(filters, { page: 1, limit: 100000 })
  const stops = result.data

  // Generate CSV with UTF-8 BOM for proper Vietnamese character encoding
  const csvHeaders = ['Name', 'Latitude', 'Longitude', 'Address', 'Active', 'Created At']
  const csvRows = stops.map((stop) => [
    stop.name,
    stop.latitude,
    stop.longitude,
    stop.address || '',
    stop.active ? 'Yes' : 'No',
    new Date(stop.createdAt).toLocaleString(),
  ])

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  // Add UTF-8 BOM to ensure proper encoding in Excel
  const utf8BOM = '\uFEFF'
  return utf8BOM + csvContent
}

export const routeService = {
  // Stops
  createStop,
  updateStop,
  deleteStop,
  getStop,
  listStops,
  autocompleteStops,
  searchStopsPublic,
  bulkImportStops,
  exportStops,
  // Routes
  createRoute,
  updateRoute,
  deleteRoute,
  getRoute,
  listRoutes,
  searchRoutesPublic,
  getPopularRoutes,
}
