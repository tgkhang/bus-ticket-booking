import express from 'express'
import { operatorController } from '~/controllers/operatorController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { operatorValidation } from '~/validations/operatorValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

// ============================================
// OPERATOR CRUD ENDPOINTS
// ============================================

// Create a new operator
Router.post(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_OPERATORS]),
  operatorValidation.createNewOperator,
  operatorController.createOperator
)

// List all operators (with filters and pagination)
Router.get(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_OPERATORS]),
  operatorController.listOperators
)

// Get specific operator details
Router.get(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_OPERATORS]),
  operatorController.getOperator
)

// Update operator
Router.put(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_OPERATORS]),
  operatorValidation.updateOperator,
  operatorController.updateOperator
)

// Delete operator
Router.delete(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_OPERATORS]),
  operatorController.deleteOperator
)

// ============================================
// ADDITIONAL HELPFUL ENDPOINTS
// ============================================

// Get operator statistics
Router.get(
  '/:id/statistics',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_OPERATORS]),
  operatorController.getOperatorStatistics
)

// Approve operator (admin only)
Router.post(
  '/:id/approve',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_OPERATORS]),
  operatorController.approveOperator
)

// Suspend operator (admin only)
Router.post(
  '/:id/suspend',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_OPERATORS]),
  operatorController.suspendOperator
)

export const operatorRoute = Router
