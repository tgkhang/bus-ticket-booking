import { StatusCodes } from 'http-status-codes'
import { feedbackService } from '~/services/feedbackService'

const listTripFeedbacks = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const { page, limit } = req.query

    const result = await feedbackService.listTripFeedbacks(tripId, { page, limit })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getMyTripFeedbackContext = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded?.id
    const { tripId } = req.params

    const result = await feedbackService.getMyTripFeedbackContext(userId, tripId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const upsertBookingFeedback = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id: bookingId } = req.params

    const feedback = await feedbackService.upsertBookingFeedback(userId, bookingId, req.body || {})
    res.status(StatusCodes.OK).json(feedback)
  } catch (error) {
    next(error)
  }
}

const getBookingFeedbackContext = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id: bookingId } = req.params

    const result = await feedbackService.getBookingFeedbackContext(userId, bookingId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const feedbackController = {
  listTripFeedbacks,
  getMyTripFeedbackContext,
  upsertBookingFeedback,
  getBookingFeedbackContext,
}
