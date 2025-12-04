import express from 'express'
import { userRoute } from '~/routes/v1/userRoute'
import { routeRoute } from '~/routes/v1/routeRoute'
import { busRoute } from './busRoute'
import { operatorRoute } from './operatorRoute'
import { tripRoute } from './tripRoute'
import { stopRoute } from './stopRoute'

const Router = express.Router()

// Health check endpoint
Router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bus Ticket Booking API is running!',
    timestamp: new Date().toISOString(),
  })
})

// User routes
Router.use('/users', userRoute)

Router.use('/buses', busRoute)

Router.use('/operators', operatorRoute)

Router.use('/stops', stopRoute);

Router.use('/routes', routeRoute)

// Trip search route
Router.use('/', tripRoute)

export const APIs_V1 = Router
