import { bookingModel } from '~/models/bookingModel'
import { seatStatusModel } from '~/models/seatStatusModel'
import { tripModel } from '~/models/tripModel'
import { seatLockService } from '~/services/seatLockService'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { GET_DB } from '~/config/prisma'

const createBooking = async (userId, bookingData) => {
  const prisma = GET_DB()
  
  try {
    const { tripId, seatIds, passengers, totalAmount } = bookingData

    // Validate input
    if (!tripId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid booking data: tripId and seatIds are required')
    }

    // Validate Redis locks
    const hasLock = await seatLockService.validateLock(tripId, seatIds, userId)
    if (!hasLock) {
      throw new ApiError(StatusCodes.CONFLICT, 'One or more seats are locked by another user')
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid booking data: passengers information is required')
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid booking data: totalAmount must be a positive number')
    }

    if (seatIds.length !== passengers.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Number of seats must match number of passengers')
    }

    console.log('Creating booking:', { userId, tripId, seatIds: seatIds.length, passengers: passengers.length, totalAmount })

    // Validate trip exists
    const trip = await tripModel.getTripById(tripId)
    if (!trip) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Trip not found')
    }

    // Check if trip is still bookable
    if (trip.status !== 'scheduled') {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Trip is not available for booking (status: ${trip.status})`)
    }

    // Release expired locks first
    await seatStatusModel.releaseExpiredLocks()

    // Create booking with passenger details and seat updates in a single transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Check seat availability within transaction
      const seatStatuses = await tx.seatStatus.findMany({
        where: {
          tripId,
          seatId: { in: seatIds },
        },
        include: {
          seat: true,
        },
      })

      if (seatStatuses.length !== seatIds.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more seats do not exist for this trip')
      }

      const unavailableSeats = seatStatuses.filter(s => s.status !== 'available' && s.status !== 'locked')
      if (unavailableSeats.length > 0) {
        throw new ApiError(StatusCodes.CONFLICT, `Seats are no longer available: ${unavailableSeats.map(s => s.seatId).join(', ')}`)
      }

      // Create booking record
      const newBooking = await tx.booking.create({
        data: {
          userId,
          tripId,
          totalAmount: parseFloat(totalAmount.toString()), // Ensure proper number format for Decimal
          status: 'confirmed',
        },
      })

      // Map seatId to seatNumber
      const seatIdToNumber = Object.fromEntries(seatStatuses.map(s => [s.seatId, s.seat.seatNumber]))

      // Create passenger details
      const passengerData = passengers.map((p, index) => ({
        bookingId: newBooking.id,
        fullName: p.fullName.trim(),
        documentId: p.documentId.trim(),
        seatCode: seatIdToNumber[seatIds[index]],
      }))

      await tx.passengerDetail.createMany({
        data: passengerData,
      })

      // Keep seats locked until payment confirmation (extend lock to 30 minutes)
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes for payment

      const updateResult = await tx.seatStatus.updateMany({
        where: {
          tripId,
          seatId: { in: seatIds },
          status: { in: ['available', 'locked'] }, // Can book if available or locked
        },
        data: {
          status: 'booked', // Mark as booked (pending payment)
          lockedUntil: lockUntil,
        },
      })

      if (updateResult.count !== seatIds.length) {
        throw new ApiError(StatusCodes.CONFLICT, 'Failed to reserve all seats. Some seats may have been taken by another user.')
      }

      console.log('Booking created successfully:', newBooking.id)
      return newBooking
    })

    // Fetch complete booking with all relations
    const completeBooking = await bookingModel.getBookingById(booking.id)
    
    // Release Redis locks as seats are now reserved in DB
    await seatLockService.unlockSeats(tripId, seatIds, userId)

    if (!completeBooking) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Booking was created but could not be retrieved')
    }
    
    return completeBooking
    
  } catch (error) {
    // Log error details safely
    console.error('Error creating booking:', {
      message: error.message,
      code: error.code,
      name: error.name,
      statusCode: error.statusCode
    })
    
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      throw new ApiError(StatusCodes.CONFLICT, 'Booking with this data already exists')
    }
    
    if (error.code === 'P2003') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid reference: Trip or User does not exist')
    }
    
    if (error.code === 'P2025') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Record not found')
    }
    
    // Generic error
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to create booking: ${error.message || 'Unknown error'}`)
  }
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

const getSeatStatusesByTripId = async (tripId) => {
  // Release expired locks first
  await seatStatusModel.releaseExpiredLocks()

  const seatStatuses = await seatStatusModel.getSeatStatusesByTripId(tripId)
  
  // Get Redis locks
  const lockedSeats = await seatLockService.getLockedSeats(tripId)
  const lockedSeatIds = new Set(lockedSeats.map(s => s.seatId))

  return seatStatuses.map((ss) => {
    let status = ss.status
    
    // If seat is locked in Redis, override status
    if (lockedSeatIds.has(ss.seatId) && status === 'available') {
      status = 'locked'
    }

    return {
      id: ss.id,
      seatId: ss.seatId,
      seatCode: ss.seat.seatNumber, // Changed from seatCode to seatNumber to match schema
      status: status,
      lockedUntil: ss.lockedUntil,
    }
  })
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

  // Idempotency: If already confirmed, return the existing booking
  if (booking.status === 'confirmed') {
    console.log('Booking already confirmed (idempotent):', bookingId)
    return booking
  }

  if (booking.status !== 'pending') {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Booking is not in pending status (current status: ${booking.status})`)
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

    // Get seat IDs from passenger details to mark as booked
    const seatCodes = booking.passengerDetails.map((p) => p.seatCode)

    // Find seat IDs from seat codes
    const seats = await tx.seat.findMany({
      where: {
        seatNumber: { in: seatCodes },
        busId: booking.trip.busId,
      },
    })

    const seatIds = seats.map((s) => s.id)

    // Mark seats as booked and remove lock
    if (seatIds.length > 0) {
      await tx.seatStatus.updateMany({
        where: {
          tripId: booking.tripId,
          seatId: { in: seatIds },
        },
        data: {
          status: 'booked',
          lockedUntil: null,
        },
      })
    }

    // Attach meta info for controller broadcast
    const resultWithMeta = {
      ...updatedBooking,
      __meta: { seatIdsBooked: seatIds }
    }
    return resultWithMeta
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
        seatNumber: { in: seatCodes },
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
  getSeatStatusesByTripId,
  confirmBooking,
  cancelBooking,
}
