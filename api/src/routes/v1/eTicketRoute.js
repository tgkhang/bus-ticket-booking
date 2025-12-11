import express from 'express'
import { eTicketController } from '~/controllers/eTicketController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.get('/bookings/:id/e-ticket', authMiddleware.isAuthorized, eTicketController.downloadETicket)
Router.post('/bookings/:id/e-ticket/email', authMiddleware.isAuthorized, eTicketController.sendETicketEmail)

export { Router as eTicketRoute }
