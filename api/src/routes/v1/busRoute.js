import express from 'express'
import { busController } from '~/controllers/busController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'
import { busValidation } from '~/validations/busValidation'
import { PERMISSIONS } from '~/utils/constants'
import { asyncHandler } from '~/helpers/asyncHandler'

const Router = express.Router()

// ============================================
// BUS CRUD ENDPOINTS
// ============================================

// Create a new bus
Router.post(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  busValidation.createNewBus,
  busController.createBus
)

// List all buses (with filters and pagination)
Router.get(
  '/',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BUSES]),
  busController.listBuses
)

// Search buses (public or authenticated)
Router.get(
  '/search',
  // No auth required for public search
  busController.searchBuses
)

// Get specific bus details
Router.get(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BUSES]),
  busController.getBus
)

// Update bus
Router.put(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  busValidation.updateBus,
  busController.updateBus
)

// Delete bus
Router.delete(
  '/:id',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  busController.deleteBus
)

// ============================================
// SEAT MANAGEMENT ENDPOINTS
// ============================================

// Create seats for a bus
Router.post(
  '/:busId/seats',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  busValidation.createSeats,
  busController.createSeats
)

// Auto-generate seat layout
Router.post(
  '/:busId/seats/generate',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  busValidation.generateSeats,
  busController.generateSeats
)

// Get all seats for a bus
Router.get(
  '/:busId/seats',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.READ_BUSES]),
  busController.listSeats
)

// Update a specific seat
Router.put(
  '/:busId/seats/:seatId',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  busValidation.updateSeat,
  busController.updateSeat
)

// Delete a seat
Router.delete(
  '/:busId/seats/:seatId',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  busController.deleteSeat
)

// delete all seats for a bus, useful for regenerating layout
Router.delete(
  '/:busId/allSeats',
  authMiddleware.isAuthorized,
  rbacMiddleware.isValidPermission([PERMISSIONS.MANAGE_BUSES]),
  asyncHandler(busController.deleteAllSeats)
)

// ============================================
// ADDITIONAL HELPFUL ENDPOINTS
// ============================================

// Get seat layout for booking (public)
Router.get('/:busId/layout', busController.getSeatLayout)

// Get bus schedule/trips
Router.get('/:busId/trips', busController.getBusTrips)

// Check bus availability
Router.get('/:busId/availability', busController.checkAvailability)

export const busRoute = Router
