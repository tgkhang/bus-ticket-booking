import express from 'express'
import { seatController } from '~/controllers/seatController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/lock')
  .post(authMiddleware.isAuthorized, seatController.lockSeats)

Router.route('/unlock')
  .post(authMiddleware.isAuthorized, seatController.unlockSeats)

Router.route('/locked/:tripId')
  .get(seatController.getLockedSeats)

export const seatRoute = Router
