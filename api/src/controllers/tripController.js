import { StatusCodes } from 'http-status-codes'
import { tripService } from '~/services/tripService'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

const search = async (req, res, next) => {
  try {
    const filters = res.locals.filters || req.query || {}
    const result = await tripService.searchTrips(filters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params
    const trip = await tripService.getTripById(id)
    res.status(StatusCodes.OK).json(trip)
  } catch (error) {
    next(error)
  }
}

const createTrip = async (req, res, _next) => {
  const userRole = req.jwtDecoded.role
  const userOperatorId = req.jwtDecoded.operatorId || null

  const trip = await tripService.createTrip(req.body, userRole, userOperatorId)
  res.status(StatusCodes.CREATED).json(trip)
}

const listTrips = async (req, res, next) => {
  // const userRole = req.jwtDecoded.role

  const filters = {
    routeId: req.query.routeId,
    busId: req.query.busId,
    departureTime: req.query.departureTime,
    arrivalTime: req.query.arrivalTime,
    basePrice: req.query.basePrice,
    status: req.query.status,
    search: req.query.search,
  }

  let { page, limit } = req.query

  if (!page) page = DEFAULT_PAGE
  if (!limit) limit = DEFAULT_ITEMS_PER_PAGE

  const pagination = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  }

  const result = await tripService.listTrips(filters, pagination)
  res.status(StatusCodes.OK).json(result)
}

const updateTrip = async (req, res, next) => {
  const { id } = req.params
  const trip = await tripService.updateTrip(id, req.body)
  res.status(StatusCodes.OK).json(trip)
}

const deleteTrip = async (req, res, next) => {
  const { id } = req.params
  const result = await tripService.deleteTrip(id)
  res.status(StatusCodes.OK).json(result)
}

export const tripController = {
  createTrip,
  search,
  getTripById,
  updateTrip,
  deleteTrip,
  listTrips,
}
