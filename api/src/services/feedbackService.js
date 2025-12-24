import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { GET_DB } from '~/config/prisma'
import { feedbackModel } from '~/models/feedbackModel'

const listTripFeedbacks = async (tripId, filters = {}) => {
  return feedbackModel.listTripFeedbacks(tripId, filters)
}

const getMyTripFeedbackContext = async (userId, tripId) => {
  const booking = await feedbackModel.getMyReviewContextForTrip(userId, tripId)

  if (!booking) {
    return { eligible: false }
  }

  return {
    eligible: true,
    bookingId: booking.id,
    feedback: booking.feedback || null,
  }
}

const upsertBookingFeedback = async (userId, bookingId, payload) => {
  const prisma = GET_DB()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      tripId: true,
      status: true,
      trip: { select: { id: true, arrivalTime: true } },
    },
  })

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  if (booking.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only review your own booking')
  }

  if (String(booking.status).toLowerCase() !== 'completed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You can only review completed trips')
  }

  // Optional extra guard: ensure arrival time passed.
//   if (booking.trip?.arrivalTime) {
//     const arrival = new Date(booking.trip.arrivalTime)
//     if (!isNaN(arrival.getTime()) && arrival.getTime() > Date.now()) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'You can only review after the trip has arrived')
//     }
//   }

  const rating = Number(payload.rating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Rating must be between 1 and 5')
  }

  const feedback = await feedbackModel.upsertFeedbackForBooking(bookingId, {
    tripId: booking.tripId,
    userId,
    rating,
    comment: payload.comment || null,
  })

  return feedback
}

const getBookingFeedbackContext = async (userId, bookingId) => {
  const prisma = GET_DB()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      tripId: true,
      status: true,
      trip: { select: { arrivalTime: true } },
      feedback: true,
    },
  })

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  if (booking.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only review your own booking')
  }

  const statusOk = String(booking.status).toLowerCase() === 'completed'

  let arrivalPassed = true
  // Optional extra guard: ensure arrival time passed.
//   if (booking.trip?.arrivalTime) {
//     const arrival = new Date(booking.trip.arrivalTime)
//     if (!isNaN(arrival.getTime())) {
//       arrivalPassed = arrival.getTime() <= Date.now()
//     }
//   }

  return {
    eligible: statusOk && arrivalPassed,
    tripId: booking.tripId,
    feedback: booking.feedback || null,
  }
}

export const feedbackService = {
  listTripFeedbacks,
  getMyTripFeedbackContext,
  upsertBookingFeedback,
  getBookingFeedbackContext,
}
