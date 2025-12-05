import { bookingModel } from '~/models/bookingModel'
import { seatStatusModel } from '~/models/seatStatusModel'
import { tripModel } from '~/models/tripModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { GET_DB } from '~/config/prisma'

const createBooking = async (userId, bookingData) => {
  const prisma = GET_DB()
  const { tripId, seatIds, passengers, totalAmount } = bookingData

  // Validate trip exists
  const trip = await tripModel.getTripById(tripId)
  if (!trip) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Trip not found')
  }

  // Check if seats are still available (should be locked by this user)
  const available = await seatStatusModel.checkSeatsAvailability(tripId, seatIds)
  if (!available) {
    throw new ApiError(StatusCodes.CONFLICT, 'One or more seats are no longer available')
  }

  // Create booking with passenger details in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Create booking
    const newBooking = await tx.booking.create({
      data: {
        userId,
        tripId,
        totalAmount,
        status: 'pending',
      },
    })

    // Create passenger details
    await tx.passengerDetail.createMany({
      data: passengers.map((p) => ({
        bookingId: newBooking.id,
        fullName: p.fullName,
        documentId: p.documentId,
        seatCode: p.seatCode,
      })),
    })

    // Book the seats (change from locked to booked)
    await seatStatusModel.bookSeats(tripId, seatIds)

    return newBooking
  })

  // Fetch complete booking with relations
  return bookingModel.getBookingById(booking.id)
}

const getBookingById = async (bookingId, userId) => {
  const booking = await bookingModel.getBookingById(bookingId)
  
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  // Check if user owns this booking (unless admin)
  if (booking.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to view this booking')
  }

  return booking
}

const getUserBookings = async (userId, filters) => {
  return bookingModel.getUserBookings(userId, filters)
}

const lockSeats = async (tripId, seatIds, lockDuration = 10) => {
  // Release expired locks first
  await seatStatusModel.releaseExpiredLocks()

  // Check if seats are available
  const available = await seatStatusModel.checkSeatsAvailability(tripId, seatIds)
  if (!available) {
    throw new ApiError(StatusCodes.CONFLICT, 'One or more seats are not available')
  }

  // Lock the seats
  const lockedUntil = await seatStatusModel.lockSeats(tripId, seatIds, lockDuration)
  
  return {
    success: true,
    lockedUntil,
    message: `Seats locked until ${lockedUntil.toISOString()}`,
  }
}

const getSeatStatusesByTripId = async (tripId) => {
  // Release expired locks first
  await seatStatusModel.releaseExpiredLocks()

  const seatStatuses = await seatStatusModel.getSeatStatusesByTripId(tripId)
  
  return seatStatuses.map((ss) => ({
    id: ss.id,
    seatId: ss.seatId,
    seatCode: ss.seat.seatNumber, // Changed from seatCode to seatNumber to match schema
    status: ss.status,
    lockedUntil: ss.lockedUntil,
  }))
}

const confirmBooking = async (bookingId, userId, paymentData) => {
  const prisma = GET_DB()
  
  const booking = await bookingModel.getBookingById(bookingId)
  
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  if (booking.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to confirm this booking')
  }

  if (booking.status !== 'pending') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking is not in pending status')
  }

  // Create payment and update booking status in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create payment record
    await tx.payment.create({
      data: {
        bookingId,
        provider: paymentData.provider || 'card',
        transactionRef: paymentData.transactionRef,
        amount: booking.totalAmount,
        status: 'completed',
        processedAt: new Date(),
      },
    })

    // Update booking status
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed' },
      include: {
        trip: {
          include: {
            route: {
              include: {
                originStop: true,
                destinationStop: true,
              },
            },
            bus: true,
          },
        },
        passengerDetails: true,
        payments: true,
      },
    })

    return updatedBooking
  })

  return result
}

const cancelBooking = async (bookingId, userId) => {
  const booking = await bookingModel.getBookingById(bookingId)
  
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  if (booking.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to cancel this booking')
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking is already cancelled')
  }

  if (booking.status === 'completed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot cancel completed booking')
  }

  // Cancel booking and release seats
  const prisma = GET_DB()
  await prisma.$transaction(async (tx) => {
    // Update booking status
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })

    // Get seat IDs from passenger details
    const seatCodes = booking.passengerDetails.map((p) => p.seatCode)
    
    // Find seat IDs from seat codes
    const seats = await tx.seat.findMany({
      where: {
        seatCode: { in: seatCodes },
        busId: booking.trip.busId,
      },
    })

    const seatIds = seats.map((s) => s.id)

    // Release seats
    if (seatIds.length > 0) {
      await tx.seatStatus.updateMany({
        where: {
          tripId: booking.tripId,
          seatId: { in: seatIds },
        },
        data: {
          status: 'available',
          lockedUntil: null,
        },
      })
    }
  })

  return { success: true, message: 'Booking cancelled successfully' }
}

export const bookingService = {
  createBooking,
  getBookingById,
  getUserBookings,
  lockSeats,
  getSeatStatusesByTripId,
  confirmBooking,
  cancelBooking,
}
