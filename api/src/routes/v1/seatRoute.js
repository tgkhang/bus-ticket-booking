import express from 'express'
import { seatController } from '~/controllers/seatController'
import { optionalAuthMiddleware } from '~/middlewares/optionalAuthMiddleware'
import { guestSessionMiddleware } from '~/middlewares/guestSessionMiddleware'

const Router = express.Router()

Router.route('/lock')
  .post(optionalAuthMiddleware.tryAuthorize, guestSessionMiddleware.ensureGuestSession, seatController.lockSeats)

Router.route('/unlock')
  .post(optionalAuthMiddleware.tryAuthorize, guestSessionMiddleware.ensureGuestSession, seatController.unlockSeats)

Router.route('/locked/:tripId')
  .get(seatController.getLockedSeats)

export const seatRoute = Router
