import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { bookingController } from '~/controllers/bookingController'
import { feedbackController } from '~/controllers/feedbackController'
import { bookingValidation } from '~/validations/bookingValidation'
import { feedbackValidation } from '~/validations/feedbackValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

// Create booking
Router.post(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.CREATE_BOOKINGS]),
  bookingValidation.createBooking,
  bookingController.createBooking
)

// Get user's bookings
Router.get(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BOOKINGS]),
  bookingController.getUserBookings
)

// Get booking by ID
Router.get(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BOOKINGS]),
  bookingValidation.getBookingById,
  bookingController.getBookingById
)

// Booking feedback context (eligibility + existing feedback)
Router.get(
  '/:id/feedback',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BOOKINGS]),
  feedbackValidation.getBookingFeedbackContext,
  feedbackController.getBookingFeedbackContext
)

// Confirm booking (payment)
Router.post(
  '/:id/confirm',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.UPDATE_BOOKINGS]),
  bookingValidation.confirmBooking,
  bookingController.confirmBooking
)

// Cancel booking
Router.post(
  '/:id/cancel',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.UPDATE_BOOKINGS]),
  bookingValidation.getBookingById,
  bookingController.cancelBooking
)

// Create or update feedback for a booking (1 feedback per booking)
Router.post(
  '/:id/feedback',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.UPDATE_BOOKINGS]),
  feedbackValidation.upsertBookingFeedback,
  feedbackController.upsertBookingFeedback
)

export const bookingRoute = Router
