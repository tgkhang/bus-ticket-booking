import express from 'express'
import { userRoute } from '~/routes/v1/userRoute'
import { routeRoute } from '~/routes/v1/routeRoute'
import { busRoute } from './busRoute'
import { operatorRoute } from './operatorRoute'
import { tripRoute } from './tripRoute'
import { stopRoute } from './stopRoute'
import { eTicketRoute } from './eTicketRoute'
import { bookingRoute } from './bookingRoute'
import { paymentRoute } from './paymentRoute'
import { seatRoute } from './seatRoute'
import revenueRoute from './revenueRoute';
const bookingAnalyticsRoute = require('./bookingAnalyticsRoute');

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

Router.use('/stops', stopRoute)

Router.use('/routes', routeRoute)

Router.use('/trips', tripRoute)

Router.use('/payments', paymentRoute)

// E-ticket routes
Router.use('/', eTicketRoute)
// Booking routes
Router.use('/', bookingRoute)

// Revenue routes
Router.use('/revenue', revenueRoute)

// Booking analytics routes
Router.use('/analytics', bookingAnalyticsRoute)

Router.use('/seats', seatRoute)

export const APIs_V1 = Router
