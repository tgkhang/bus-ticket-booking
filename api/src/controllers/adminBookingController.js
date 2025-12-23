import { StatusCodes } from 'http-status-codes'
import { bookingService } from '~/services/bookingService'

const listBookings = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    }

    const result = await bookingService.getAdminBookings(filters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params
    const booking = await bookingService.getBookingByIdAdmin(id)
    res.status(StatusCodes.OK).json(booking)
  } catch (error) {
    next(error)
  }
}

const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const booking = await bookingService.confirmBookingAdmin(id)
    res.status(StatusCodes.OK).json(booking)
  } catch (error) {
    next(error)
  }
}

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await bookingService.cancelBookingAdmin(id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const adminBookingController = {
  listBookings,
  getBookingDetails,
  confirmBooking,
  cancelBooking,
}
