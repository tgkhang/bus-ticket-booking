import express from 'express'
import { routeController } from '~/controllers/routeController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { routeValidation } from '~/validations/routeValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

Router.post(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_ROUTES]),
  routeValidation.createRoute,
  routeController.createRoute
)

Router.get(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ROUTES]),
  routeController.listRoutes
)

Router.get(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ROUTES]),
  routeController.getRoute
)
Router.put(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_ROUTES]),
  routeValidation.updateRoute,
  routeController.updateRoute
)

Router.delete(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_ROUTES]),
  routeController.deleteRoute
)

export const routeRoute = Router
