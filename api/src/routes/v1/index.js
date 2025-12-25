import express from 'express'
import { userRoute } from '~/routes/v1/userRoute'
import { routeRoute } from '~/routes/v1/routeRoute'
import { busRoute } from './busRoute'
import { operatorRoute } from './operatorRoute'
import { tripRoute } from './tripRoute'
import { stopRoute } from './stopRoute'
import { eTicketRoute } from './eTicketRoute'
import { bookingRoute } from './bookingRoute'
import { adminBookingRoute } from './adminBookingRoute'
import { paymentRoute } from './paymentRoute'
import { seatRoute } from './seatRoute'
import { authRoute } from './authRoute'
import revenueRoute from './revenueRoute'
import { staffRoute } from './staffRoute'
const bookingAnalyticsRoute = require('./bookingAnalyticsRoute')

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

Router.use('/auth', authRoute)

Router.use('/buses', busRoute)

Router.use('/operators', operatorRoute)

Router.use('/stops', stopRoute)

Router.use('/routes', routeRoute)

Router.use('/trips', tripRoute)

Router.use('/payments', paymentRoute)

// E-ticket routes
Router.use('/', eTicketRoute)
// Booking routes
Router.use('/bookings', bookingRoute)

// Admin booking routes
Router.use('/admin/bookings', adminBookingRoute)

// Revenue routes
Router.use('/revenue', revenueRoute)

// Booking analytics routes
Router.use('/analytics', bookingAnalyticsRoute)

Router.use('/seats', seatRoute)

// Staff routes
Router.use('/staff', staffRoute)

export const APIs_V1 = Router
