import express from 'express'
import { userRoute } from '~/routes/v1/userRoute'
import { routeRoute } from '~/routes/v1/routeRoute'

const Router = express.Router()

// User routes
Router.use('/users', userRoute)

// Transport configuration routes (routes & stops)
Router.use('/', routeRoute)

// Health check endpoint
Router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bus Ticket Booking API is running!',
    timestamp: new Date().toISOString(),
  })
})

export const APIs_V1 = Router
