import express from 'express'
import { eTicketController } from '~/controllers/eTicketController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { optionalAuthMiddleware } from '~/middlewares/optionalAuthMiddleware'

const Router = express.Router()

Router.get('/bookings/:id/e-ticket', authMiddleware.isAuthorized, eTicketController.downloadETicket)
Router.post('/bookings/:id/e-ticket/email', authMiddleware.isAuthorized, eTicketController.sendETicketEmail)

// Public endpoint to confirm booking and send email for skip payment
Router.post('/bookings/:id/confirm-and-email', optionalAuthMiddleware.tryAuthorize, eTicketController.confirmAndSendEmailPublic)

export { Router as eTicketRoute }
