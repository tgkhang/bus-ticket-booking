import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { tripController } from '~/controllers/tripController'
import { bookingController } from '~/controllers/bookingController'
import { feedbackController } from '~/controllers/feedbackController'
import { tripValidation } from '~/validations/tripValidation'
import { feedbackValidation } from '~/validations/feedbackValidation'
import { PERMISSIONS } from '~/utils/constants'
import { asyncHandler } from '~/helpers/asyncHandler.js'

const Router = express.Router()

Router.get(
  '/search',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_TRIPS]),
  tripValidation.search,
  tripController.search
)

// Get seat statuses for a trip (public - no auth required for viewing)
Router.get('/:tripId/seats', bookingController.getSeatStatuses)

// Trip feedbacks (public list)
Router.get(
  '/:tripId/feedbacks',
  feedbackValidation.listTripFeedbacks,
  feedbackController.listTripFeedbacks
)

// Trip feedback context for current user (eligible booking + existing feedback)
Router.get(
  '/:tripId/my-feedback',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BOOKINGS]),
  feedbackValidation.getMyTripFeedbackContext,
  feedbackController.getMyTripFeedbackContext
)

Router.get(
  '/:id',
  //authMiddleware.isAuthorized,
  //rbacMiddleware.isValidPermission([PERMISSIONS.READ_TRIPS]),
  tripController.getTripById
)

// create a new trip
Router.post(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_TRIPS]),
  tripValidation.createTrip,
  asyncHandler(tripController.createTrip)
)

// get list of trips
Router.get(
  '/',
  //authMiddleware.isAuthorized,
  //rbacMiddleware.isValidPermission([PERMISSIONS.READ_TRIPS]),
  asyncHandler(tripController.listTrips)
)

Router.put(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_TRIPS]),
  tripValidation.updateTrip,
  asyncHandler(tripController.updateTrip)
)

Router.delete(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_TRIPS]),
  asyncHandler(tripController.deleteTrip)
)

export const tripRoute = Router
