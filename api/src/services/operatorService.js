import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { operatorModel } from '~/models/operatorModel'

// ============================================
// HELPER FUNCTIONS
// ============================================

const ensureOperatorExists = async (operatorId) => {
  const operator = await operatorModel.findOperatorById(operatorId)
  if (!operator) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Operator not found')
  }
  return operator
}

// ============================================
// OPERATOR CRUD SERVICES
// ============================================

const createOperator = async (payload, userRole) => {
  // Check if email already exists
  const existing = await operatorModel.findOperatorByEmail(payload.contactEmail)
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Operator with this email already exists')
  }

  // Only admins can set status directly, others default to pending
  if (userRole !== 'admin') {
    payload.status = 'pending'
  }

  // Create operator
  return await operatorModel.createOperator(payload)
}

const getOperator = async (operatorId, includeDetails = false) => {
  let operator

  if (includeDetails) {
    operator = await operatorModel.getOperatorWithDetails(operatorId)
  } else {
    operator = await operatorModel.findOperatorById(operatorId)
  }

  if (!operator) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Operator not found')
  }

  return operator
}

const listOperators = async (filters, pagination) => {
  return await operatorModel.findAllOperators(filters, pagination)
}

const updateOperator = async (operatorId, payload, userRole) => {
  // Check operator exists
  await ensureOperatorExists(operatorId)

  // Check if updating email and it conflicts with another operator
  if (payload.contactEmail) {
    const existing = await operatorModel.findOperatorByEmail(payload.contactEmail)
    if (existing && existing.id !== operatorId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Another operator with this email already exists')
    }
  }

  // Only admins can change operator status
  if (payload.status && userRole !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admins can change operator status')
  }

  return await operatorModel.updateOperator(operatorId, payload)
}

const deleteOperator = async (operatorId, userRole) => {
  // Check operator exists
  await ensureOperatorExists(operatorId)

  // Check if operator has any active resources (buses or routes)
  const resources = await operatorModel.checkOperatorHasActiveResources(operatorId)

  if (resources.hasAny) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `Cannot delete operator with active resources. Operator has ${resources.counts.buses} buses and ${resources.counts.routes} routes. Please delete them first.`
    )
  }

  return await operatorModel.deleteOperator(operatorId)
}

// ============================================
// ADDITIONAL SERVICES
// ============================================

const getOperatorStatistics = async (operatorId) => {
  // Check operator exists
  await ensureOperatorExists(operatorId)

  return await operatorModel.getOperatorStatistics(operatorId)
}

const approveOperator = async (operatorId, userRole) => {
  // Only admins can approve
  if (userRole !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admins can approve operators')
  }

  // Check operator exists
  const operator = await ensureOperatorExists(operatorId)

  // Check if already approved
  if (operator.status === 'approved') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Operator is already approved')
  }

  return await operatorModel.updateOperator(operatorId, { status: 'approved' })
}

const suspendOperator = async (operatorId, userRole) => {
  // Only admins can suspend
  if (userRole !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admins can suspend operators')
  }

  // Check operator exists
  const operator = await ensureOperatorExists(operatorId)

  // Check if already suspended
  if (operator.status === 'suspended') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Operator is already suspended')
  }

  return await operatorModel.updateOperator(operatorId, { status: 'suspended' })
}

export const operatorService = {
  createOperator,
  getOperator,
  listOperators,
  updateOperator,
  deleteOperator,
  getOperatorStatistics,
  approveOperator,
  suspendOperator,
}
