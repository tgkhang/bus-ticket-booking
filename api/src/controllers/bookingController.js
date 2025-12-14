import { StatusCodes } from 'http-status-codes'
import { bookingService } from '~/services/bookingService'

const createBooking = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded.id
    const bookingData = req.body
    const booking = await bookingService.createBooking(userId, bookingData)
    // Notify clients that seats are now booked
    if (bookingData?.tripId && Array.isArray(bookingData?.seatIds) && bookingData.seatIds.length > 0) {
      req.io.emit('seats:booked', { tripId: bookingData.tripId, seatIds: bookingData.seatIds })
    }
    res.status(StatusCodes.CREATED).json(booking)
  } catch (error) {
    next(error)
  }
}

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.jwtDecoded.id
    const booking = await bookingService.getBookingById(id, userId)
    res.status(StatusCodes.OK).json(booking)
  } catch (error) {
    next(error)
  }
}

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded.id
    const filters = {
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    }
    const result = await bookingService.getUserBookings(userId, filters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getSeatStatuses = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const seatStatuses = await bookingService.getSeatStatusesByTripId(tripId)
    res.status(StatusCodes.OK).json(seatStatuses)
  } catch (error) {
    next(error)
  }
}

const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.jwtDecoded.id
    const paymentData = req.body
    const booking = await bookingService.confirmBooking(id, userId, paymentData)
    // If service returns seatIdsBooked, broadcast booked event
    if (booking?.__meta?.seatIdsBooked && booking?.tripId) {
      req.io.emit('seats:booked', { tripId: booking.tripId, seatIds: booking.__meta.seatIdsBooked })
      // Clean meta before responding
      delete booking.__meta
    }
    res.status(StatusCodes.OK).json(booking)
  } catch (error) {
    next(error)
  }
}

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.jwtDecoded.id
    const result = await bookingService.cancelBooking(id, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const bookingController = {
  createBooking,
  getBookingById,
  getUserBookings,
  getSeatStatuses,
  confirmBooking,
  cancelBooking,
}
