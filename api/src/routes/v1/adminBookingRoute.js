import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { adminBookingController } from '~/controllers/adminBookingController'
import { bookingValidation } from '~/validations/bookingValidation'
import { PERMISSIONS } from '~/utils/constants'

const Router = express.Router()

// Admin: list all bookings (supports status + date filters)
Router.get(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BOOKINGS]),
  adminBookingController.listBookings
)

// Admin: get booking details (includes passengers + payments)
Router.get(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BOOKINGS]),
  bookingValidation.getBookingById,
  adminBookingController.getBookingDetails
)

// Admin: confirm a pending booking immediately
Router.post(
  '/:id/confirm',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BOOKINGS]),
  bookingValidation.getBookingById,
  adminBookingController.confirmBooking
)

// Admin: cancel a pending/confirmed booking immediately
Router.post(
  '/:id/cancel',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BOOKINGS]),
  bookingValidation.getBookingById,
  adminBookingController.cancelBooking
)

export const adminBookingRoute = Router
