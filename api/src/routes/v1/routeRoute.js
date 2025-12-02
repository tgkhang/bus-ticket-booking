import express from 'express'
import { routeController } from '~/controllers/routeController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { routeValidation } from '~/validations/routeValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

// Stops endpoints
// Public autocomplete endpoint (no auth required for search form)
Router.get('/stops/autocomplete', routeController.autocompleteStops)

Router.post(
  '/stops',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeValidation.createStop,
  routeController.createStop
)
Router.get(
  '/stops',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_STOPS]),
  routeController.listStops
)
Router.get(
  '/stops/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_STOPS]),
  routeController.getStop
)
Router.put(
  '/stops/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeValidation.updateStop,
  routeController.updateStop
)
Router.delete(
  '/stops/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeController.deleteStop
)

// Routes endpoints
Router.post(
  '/routes',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_ROUTES]),
  routeValidation.createRoute,
  routeController.createRoute
)
Router.get(
  '/routes',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ROUTES]),
  routeController.listRoutes
)
Router.get(
  '/routes/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ROUTES]),
  routeController.getRoute
)
Router.put(
  '/routes/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_ROUTES]),
  routeValidation.updateRoute,
  routeController.updateRoute
)
Router.delete(
  '/routes/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_ROUTES]),
  routeController.deleteRoute
)

export const routeRoute = Router
