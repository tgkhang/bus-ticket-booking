import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { tripController } from '~/controllers/tripController'
import { tripValidation } from '~/validations/tripValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

Router.get('/trips/search',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_TRIPS]),
  tripValidation.search,
  tripController.search
)

Router.get('/trips/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_TRIPS]),
  tripValidation.getTripById,
  tripController.getTripById
)

export const tripRoute = Router
