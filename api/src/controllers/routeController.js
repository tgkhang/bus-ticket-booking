import { StatusCodes } from 'http-status-codes'
import { routeService } from '~/services/routeService'

// Routes
const createRoute = async (req, res, next) => {
  try {
    const result = await routeService.createRoute(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const listRoutes = async (_req, res, next) => {
  try {
    const result = await routeService.listRoutes()
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

const listStops = async (_req, res, next) => {
  try {
    const result = await routeService.listStops()
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

const autocompleteStops = async (req, res, next) => {
  try {
    const { q, limit } = req.query
    const result = await routeService.autocompleteStops(q, limit ? parseInt(limit) : 10)
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
  autocompleteStops,
}
