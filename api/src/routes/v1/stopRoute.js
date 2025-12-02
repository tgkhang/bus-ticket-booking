import express from 'express'
import { routeController } from '~/controllers/routeController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { routeValidation } from '~/validations/routeValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

Router.get(
  '/autocomplete',
  routeController.autocompleteStops
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
  '/stops/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_STOPS]),
  routeController.deleteStop
)

export const stopRoute = Router
