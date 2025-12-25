import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { PERMISSIONS } from '~/utils/constants'
import { staffController } from '~/controllers/staffController'

const Router = express.Router()

// Get staff's assigned trips
Router.get(
  '/trips',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ASSIGNED_TRIPS]),
  staffController.getMyTrips
)

// Get passengers for a specific trip
Router.get(
  '/trips/:tripId/passengers',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ASSIGNED_TRIPS]),
  staffController.getTripPassengers
)

// Mark passenger as boarded
Router.patch(
  '/passengers/:passengerId/board',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_PASSENGER_BOARDING]),
  staffController.markPassengerBoarded
)

// Update trip status (departed/arrived)
Router.patch(
  '/trips/:tripId/status',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_TRIP_STATUS]),
  staffController.updateTripStatus
)

export const staffRoute = Router
