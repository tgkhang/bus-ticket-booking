import { StatusCodes } from 'http-status-codes'
import { operatorService } from '~/services/operatorService'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

// ============================================
// OPERATOR CRUD CONTROLLERS
// ============================================

const createOperator = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role

    const result = await operatorService.createOperator(req.body, userRole)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const listOperators = async (req, res, next) => {
  try {
    // Extract query params for filtering
    const filters = {
      status: req.query.status,
      search: req.query.search,
    }

    // Extract pagination params
    let { page, limit } = req.query
    if (!page) page = DEFAULT_PAGE
    if (!limit) limit = DEFAULT_ITEMS_PER_PAGE

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    }

    const result = await operatorService.listOperators(filters, pagination)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getOperator = async (req, res, next) => {
  try {
    const includeDetails = req.query.details === 'true'
    const result = await operatorService.getOperator(req.params.id, includeDetails)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateOperator = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role

    const result = await operatorService.updateOperator(req.params.id, req.body, userRole)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteOperator = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role

    const result = await operatorService.deleteOperator(req.params.id, userRole)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

// ============================================
// ADDITIONAL CONTROLLERS
// ============================================

const getOperatorStatistics = async (req, res, next) => {
  try {
    const result = await operatorService.getOperatorStatistics(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const approveOperator = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role

    const result = await operatorService.approveOperator(req.params.id, userRole)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const suspendOperator = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role

    const result = await operatorService.suspendOperator(req.params.id, userRole)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const operatorController = {
  // Operator CRUD
  createOperator,
  listOperators,
  getOperator,
  updateOperator,
  deleteOperator,

  // Additional
  getOperatorStatistics,
  approveOperator,
  suspendOperator,
}
