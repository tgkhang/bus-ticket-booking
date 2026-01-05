import { bookingModel } from '~/models/bookingModel'
import { seatStatusModel } from '~/models/seatStatusModel'
import { tripModel } from '~/models/tripModel'
import { seatLockService } from '~/services/seatLockService'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { GET_DB } from '~/config/prisma'
import crypto from 'crypto'

const sanitizeBooking = (booking) => {
  if (!booking) return booking
  if (Object.prototype.hasOwnProperty.call(booking, 'accessTokenHash')) {
    delete booking.accessTokenHash
  }
  return booking
}

const generateReferenceCode = () => `BK-${crypto.randomBytes(6).toString('hex').toUpperCase()}`
const generateAccessToken = () => crypto.randomBytes(24).toString('base64url')
const hashAccessToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const createBooking = async (actorOrUserId, bookingData) => {
  const prisma = GET_DB()
  const actor = (typeof actorOrUserId === 'object' && actorOrUserId !== null)
    ? actorOrUserId
    : { userId: actorOrUserId, lockOwnerId: actorOrUserId }

  const userId = actor?.userId ?? null
  const lockOwnerId = actor?.lockOwnerId ?? userId
  const shouldReturnGuestAccess = Boolean(actor?.returnGuestAccess)

  try {
    const { tripId, seatIds, passengers, totalAmount } = bookingData

    // Validate input
    if (!tripId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid booking data: tripId and seatIds are required')
    }

    if (!lockOwnerId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid booking actor identity')
    }

    // Validate Redis locks
    const hasLock = await seatLockService.validateLock(tripId, seatIds, lockOwnerId)
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

    const contactInfo = actor?.contactInfo ?? bookingData?.contactInfo
    if (!userId) {
      if (!contactInfo || typeof contactInfo !== 'object') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Contact info is required for guest booking')
      }
      const email = typeof contactInfo.email === 'string' ? contactInfo.email.trim() : ''
      const phone = typeof contactInfo.phone === 'string' ? contactInfo.phone.trim() : ''
      const name = typeof contactInfo.name === 'string' ? contactInfo.name.trim() : ''
      if (!email && !phone) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Guest must provide at least email or phone')
      }
      bookingData.contactInfo = { email, phone, name }
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

    let guestAccess = null
    let referenceCode = null
    let accessTokenHash = null

    if (!userId) {
      referenceCode = generateReferenceCode()
      const accessToken = generateAccessToken()
      accessTokenHash = hashAccessToken(accessToken)
      guestAccess = { referenceCode, accessToken }
    }

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
      const createData = {
        userId,
        tripId,
        totalAmount: parseFloat(totalAmount.toString()), // Ensure proper number format for Decimal
        status: 'pending',
      }

      if (!userId) {
        createData.guestEmail = bookingData.contactInfo?.email || null
        createData.guestPhone = bookingData.contactInfo?.phone || null
        createData.guestName = bookingData.contactInfo?.name || null
        createData.referenceCode = referenceCode
        createData.accessTokenHash = accessTokenHash
      }

      let newBooking
      // Handle rare referenceCode collisions
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          newBooking = await tx.booking.create({ data: createData })
          break
        } catch (err) {
          if (!userId && err?.code === 'P2002') {
            referenceCode = generateReferenceCode()
            createData.referenceCode = referenceCode
            continue
          }
          throw err
        }
      }

      if (!newBooking) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to generate a unique booking reference')
      }

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
    sanitizeBooking(completeBooking)
    
    // Release Redis locks as seats are now reserved in DB
    await seatLockService.unlockSeats(tripId, seatIds, lockOwnerId)

    if (!completeBooking) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Booking was created but could not be retrieved')
    }
    
    if (shouldReturnGuestAccess) {
      return { booking: completeBooking, guestAccess }
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
  sanitizeBooking(booking)
  
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

const getAdminBookings = async (filters) => {
  return bookingModel.getAdminBookings(filters)
}

const getBookingByIdAdmin = async (bookingId) => {
  const booking = await bookingModel.getBookingByIdAdmin(bookingId)
  sanitizeBooking(booking)

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  return booking
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
  console.log('====== CONFIRM BOOKING ======')
  console.log('BookingId:', bookingId)
  console.log('UserId:', userId)
  console.log('PaymentData:', paymentData)

  const prisma = GET_DB()

  const booking = await bookingModel.getBookingById(bookingId)
  sanitizeBooking(booking)

  if (!booking) {
    console.error('✗ Booking not found:', bookingId)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }
  console.log('✓ Booking found, status:', booking.status)

  // For authenticated users, verify ownership
  // For guest bookings (both booking.userId and userId are null), skip check
  if (booking.userId && booking.userId !== userId) {
    console.error('✗ User does not own booking')
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to confirm this booking')
  }

  // Idempotency: If already confirmed, return the existing booking
  if (booking.status === 'confirmed') {
    console.log('ℹ Booking already confirmed (idempotent):', bookingId)
    return booking
  }

  if (booking.status !== 'pending') {
    console.error('✗ Booking is not pending, status:', booking.status)
    throw new ApiError(StatusCodes.BAD_REQUEST, `Booking is not in pending status (current status: ${booking.status})`)
  }

  // Create payment and update booking status in transaction
  console.log('Starting transaction...')
  const result = await prisma.$transaction(async (tx) => {
    console.log('Upserting payment record...')
    // Create or update payment record (upsert to handle duplicate transactionRef)
    await tx.payment.upsert({
      where: { transactionRef: paymentData.transactionRef },
      create: {
        bookingId,
        provider: paymentData.provider || 'card',
        transactionRef: paymentData.transactionRef,
        amount: booking.totalAmount,
        status: 'completed',
        processedAt: new Date(),
      },
      update: {
        status: 'completed',
        processedAt: new Date(),
      },
    })
    console.log('✓ Payment record upserted')

    // Update booking status
    console.log('Updating booking status to confirmed...')
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

    console.log('✓ Booking status updated to confirmed')

    // Get seat IDs from passenger details to mark as booked
    const seatCodes = booking.passengerDetails.map((p) => p.seatCode)
    console.log('Finding seat IDs for codes:', seatCodes)

    // Find seat IDs from seat codes
    const seats = await tx.seat.findMany({
      where: {
        seatNumber: { in: seatCodes },
        busId: booking.trip.busId,
      },
    })

    const seatIds = seats.map((s) => s.id)
    console.log('Found seat IDs:', seatIds)

    // Mark seats as booked and remove lock
    if (seatIds.length > 0) {
      console.log('Marking seats as booked...')
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
      console.log('✓ Seats marked as booked')
    }

    // Attach meta info for controller broadcast
    const resultWithMeta = {
      ...updatedBooking,
      __meta: { seatIdsBooked: seatIds }
    }
    return resultWithMeta
  })

  console.log('✓ Transaction completed successfully')
  sanitizeBooking(result)

  return result
}

const getBookingPublicByReference = async (referenceCode, token) => {
  if (!referenceCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'referenceCode is required')
  }
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'token is required')
  }

  const booking = await bookingModel.getBookingByReferenceCode(referenceCode)

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }
  if (!booking.accessTokenHash) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'This booking is not accessible via public lookup')
  }

  const tokenHash = hashAccessToken(token)
  if (tokenHash !== booking.accessTokenHash) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid token')
  }

  delete booking.accessTokenHash
  return booking
}

const cancelBookingPublicByReference = async (referenceCode, token) => {
  const booking = await getBookingPublicByReference(referenceCode, token)
  return cancelBooking(booking.id, null)
}

const cancelBooking = async (bookingId, userId) => {
  const booking = await bookingModel.getBookingById(bookingId)
  sanitizeBooking(booking)
  
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

const confirmBookingAdmin = async (bookingId) => {
  const booking = await bookingModel.getBookingByIdAdmin(bookingId)
  sanitizeBooking(booking)

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  // Idempotency: If already confirmed, return the existing booking
  if (booking.status === 'confirmed') {
    return booking
  }

  if (booking.status !== 'pending') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Booking is not in pending status (current status: ${booking.status})`
    )
  }

  return bookingModel.updateBookingStatus(bookingId, 'confirmed')
}

const cancelBookingAdmin = async (bookingId) => {
  const booking = await bookingModel.getBookingByIdAdmin(bookingId)
  sanitizeBooking(booking)

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking is already cancelled')
  }

  if (booking.status === 'completed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot cancel completed booking')
  }

  // Admin cancel should also release seats like user cancel
  const prisma = GET_DB()
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })

    const seatCodes = (booking.passengerDetails || []).map((p) => p.seatCode)
    const seats = await tx.seat.findMany({
      where: {
        seatNumber: { in: seatCodes },
        busId: booking.trip.busId,
      },
    })

    const seatIds = seats.map((s) => s.id)

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
  getAdminBookings,
  getBookingByIdAdmin,
  getSeatStatusesByTripId,
  confirmBooking,
  getBookingPublicByReference,
  cancelBookingPublicByReference,
  cancelBooking,
  confirmBookingAdmin,
  cancelBookingAdmin,
}
