import { StatusCodes } from 'http-status-codes'
import { bookingService } from '~/services/bookingService'

const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id
    const bookingData = req.body
    const booking = await bookingService.createBooking(userId, bookingData)
    res.status(StatusCodes.CREATED).json(booking)
  } catch (error) {
    next(error)
  }
}

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const booking = await bookingService.getBookingById(id, userId)
    res.status(StatusCodes.OK).json(booking)
  } catch (error) {
    next(error)
  }
}

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id
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

const lockSeats = async (req, res, next) => {
  try {
    const { tripId, seatIds, lockDuration } = req.body
    const result = await bookingService.lockSeats(tripId, seatIds, lockDuration)
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
    const userId = req.user.id
    const paymentData = req.body
    const booking = await bookingService.confirmBooking(id, userId, paymentData)
    res.status(StatusCodes.OK).json(booking)
  } catch (error) {
    next(error)
  }
}

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
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
  lockSeats,
  getSeatStatuses,
  confirmBooking,
  cancelBooking,
}
