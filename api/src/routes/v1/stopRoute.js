import express from 'express'
import { routeController } from '~/controllers/routeController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { routeValidation } from '~/validations/routeValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

// Public fulltext stop search (no auth)
Router.get('/search', routeController.searchStopsPublic)

Router.get(
  '/autocomplete',
  routeController.autocompleteStops
)

// Bulk import stops
Router.post(
  '/bulk-import',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeController.bulkImportStops
)

// Export stops to CSV
Router.get(
  '/export',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_STOPS]),
  routeController.exportStops
)

Router.post(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeValidation.createStop,
  routeController.createStop
)

Router.get(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_STOPS]),
  routeController.listStops
)

Router.get(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_STOPS]),
  routeController.getStop
)

Router.put(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeValidation.updateStop,
  routeController.updateStop
)

Router.delete(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeController.deleteStop
)

export const stopRoute = Router
