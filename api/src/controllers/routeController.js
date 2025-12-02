import { StatusCodes } from 'http-status-codes'
import { routeService } from '~/services/routeService'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

// Routes
const createRoute = async (req, res, next) => {
  try {
    const result = await routeService.createRoute(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const listRoutes = async (req, res, next) => {
  try {
    const userOperatorId = req.jwtDecoded.operatorId || null
    const filters = {
      operatorId: req.query.operatorId,
      name: req.query.name,
      originStopId: req.query.originStopId,
      destinationStopId: req.query.destinationStopId,
      active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
      estimatedMinutes: req.query.estimatedMinutes,
      search: req.query.search,
    }

    let { page, limit } = req.query
    if (!page) page = DEFAULT_PAGE
    if (!limit) limit = DEFAULT_ITEMS_PER_PAGE

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    }

    const result = await routeService.listRoutes(filters, pagination)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getRoute = async (req, res, next) => {
  try {
    const result = await routeService.getRoute(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateRoute = async (req, res, next) => {
  try {
    const result = await routeService.updateRoute(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteRoute = async (req, res, next) => {
  try {
    const result = await routeService.deleteRoute(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

// Stops
const createStop = async (req, res, next) => {
  try {
    const result = await routeService.createStop(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const listStops = async (req, res, next) => {
  try {
    const filters = {
      name: req.query.name,
      address: req.query.address,
      active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
      search: req.query.search,
    }

    let { page, limit } = req.query
    if (!page) page = DEFAULT_PAGE
    if (!limit) limit = DEFAULT_ITEMS_PER_PAGE

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    }

    const result = await routeService.listStops(filters, pagination)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getStop = async (req, res, next) => {
  try {
    const result = await routeService.getStop(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateStop = async (req, res, next) => {
  try {
    const result = await routeService.updateStop(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteStop = async (req, res, next) => {
  try {
    const result = await routeService.deleteStop(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const routeController = {
  // Routes
  createRoute,
  listRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
  // Stops
  createStop,
  listStops,
  getStop,
  updateStop,
  deleteStop,
}
