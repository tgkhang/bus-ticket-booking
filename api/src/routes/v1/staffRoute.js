import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { PERMISSIONS } from '~/utils/constants'
import { staffController } from '~/controllers/staffController'
import { asyncHandler } from '~/helpers/asyncHandler'

const Router = express.Router()

// Get staff's assigned trips
Router.get(
  '/trips',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ASSIGNED_TRIPS]),
  asyncHandler(staffController.getMyTrips)
)

// Get passengers for a specific trip
Router.get(
  '/trips/:tripId/passengers',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_ASSIGNED_TRIPS]),
  asyncHandler(staffController.getTripPassengers)
)

// Mark passenger as boarded
Router.patch(
  '/passengers/:passengerId/board',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_PASSENGER_BOARDING]),
  asyncHandler(staffController.markPassengerBoarded)
)

// Update trip status (departed/arrived)
Router.patch(
  '/trips/:tripId/status',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_TRIP_STATUS]),
  asyncHandler(staffController.updateTripStatus)
)

// Get staff by operator (for admin to assign staff to trips)
Router.get(
  '/by-operator/:operatorId',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_USERS]),
  asyncHandler(staffController.getStaffByOperator)
)

export const staffRoute = Router
