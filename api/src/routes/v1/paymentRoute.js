import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { paymentController } from '~/controllers/paymentController'
import { paymentValidation } from '~/validations/paymentValidation'
import { asyncHandler } from '~/helpers/asyncHandler.js'

const Router = express.Router()

// Create payment link - requires authentication
Router.post(
  '/create-payment-link',
  authMiddleware.isAuthorized,
  paymentValidation.createPaymentLink,
  asyncHandler(paymentController.createPaymentLink)
)

// Get payment link information
Router.get(
  '/:orderCode',
  authMiddleware.isAuthorized,
  paymentValidation.getPaymentLinkInformation,
  asyncHandler(paymentController.getPaymentLinkInformation)
)

// Webhook endpoint - no auth required (PayOS will call this)
Router.post('/webhook', asyncHandler(paymentController.confirmWebhook))

export const paymentRoute = Router
