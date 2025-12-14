import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { bookingController } from '~/controllers/bookingController'
import { bookingValidation } from '~/validations/bookingValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

// Get seat statuses for a trip (public - no auth required for viewing)
Router.get(
  '/trips/:tripId/seats',
  bookingController.getSeatStatuses
)

// Create booking
Router.post(
  '/bookings',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.CREATE_BOOKINGS]),
  bookingValidation.createBooking,
  bookingController.createBooking
)

// Get user's bookings
Router.get(
  '/bookings',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BOOKINGS]),
  bookingController.getUserBookings
)

// Get booking by ID
Router.get(
  '/bookings/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BOOKINGS]),
  bookingValidation.getBookingById,
  bookingController.getBookingById
)

// Confirm booking (payment)
Router.post(
  '/bookings/:id/confirm',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.UPDATE_BOOKINGS]),
  bookingValidation.confirmBooking,
  bookingController.confirmBooking
)

// Cancel booking
Router.post(
  '/bookings/:id/cancel',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.UPDATE_BOOKINGS]),
  bookingValidation.getBookingById,
  bookingController.cancelBooking
)

export const bookingRoute = Router
