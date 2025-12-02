import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { busModel } from '~/models/busModel'
import { seatModel } from '~/models/seatModel'
import { GET_DB } from '~/config/prisma'

// ============================================
// HELPER FUNCTIONS
// ============================================

const ensureOperatorExists = async (operatorId) => {
  const prisma = GET_DB()
  const operator = await prisma.operator.findUnique({ where: { id: operatorId } })
  if (!operator) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Operator not found')
  }
  return operator
}

const ensureBusExists = async (busId) => {
  const bus = await busModel.findBusById(busId)
  if (!bus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bus not found')
  }
  return bus
}

const checkOperatorOwnership = async (busId, operatorId) => {
  const bus = await ensureBusExists(busId)
  if (bus.operator_id !== operatorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to manage this bus')
  }
  return bus
}

// ============================================
// BUS CRUD SERVICES
// ============================================

const createBus = async (payload, userRole, userOperatorId = null) => {
  // Validate operator exists
  await ensureOperatorExists(payload.operator_id)

  // Check if operator role user is trying to create bus for another operator
  if (userRole === 'operator' && userOperatorId !== payload.operator_id) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only create buses for your own operator')
  }

  // Check if plate number already exists
  const existing = await busModel.findBusByPlateNumber(payload.plate_number)
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bus with this plate number already exists')
  }

  // Create bus
  return await busModel.createBus(payload)
}

const getBus = async (busId) => {
  const bus = await busModel.findBusById(busId)
  if (!bus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bus not found')
  }
  return bus
}

const listBuses = async (filters, pagination, userRole, userOperatorId = null) => {
  // If operator role, only show their buses
  if (userRole === 'operator' && userOperatorId) {
    filters.operatorId = userOperatorId
  }

  return await busModel.findAllBuses(filters, pagination)
}

const updateBus = async (busId, payload, userRole, userOperatorId = null) => {
  // Check bus exists
  const bus = await ensureBusExists(busId)

  // Check ownership for operator role
  if (userRole === 'operator') {
    if (!userOperatorId || bus.operator_id !== userOperatorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You can only update your own buses')
    }
  }

  // If updating plate number, check it doesn't conflict
  if (payload.plate_number) {
    const existing = await busModel.findBusByPlateNumber(payload.plate_number)
    if (existing && existing.id !== busId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Another bus with this plate number already exists')
    }
  }

  return await busModel.updateBus(busId, payload)
}

const deleteBus = async (busId, userRole, userOperatorId = null) => {
  // Check bus exists
  const bus = await ensureBusExists(busId)

  // Check ownership for operator role
  if (userRole === 'operator') {
    if (!userOperatorId || bus.operator_id !== userOperatorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You can only delete your own buses')
    }
  }

  // Check if bus has active trips
  const hasActiveTrips = await busModel.checkBusHasActiveTrips(busId)
  if (hasActiveTrips) {
    throw new ApiError(StatusCodes.CONFLICT, 'Cannot delete bus with active or scheduled trips')
  }

  await busModel.deleteBus(busId)
  return { deleted: true }
}

// ============================================
// SEAT MANAGEMENT SERVICES
// ============================================

const createSeats = async (busId, seatsData, userRole, userOperatorId = null) => {
  // Check bus exists and ownership
  const bus = await ensureBusExists(busId)
  if (userRole === 'operator' && bus.operator_id !== userOperatorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only manage seats for your own buses')
  }

  // Check for duplicate seat numbers in payload
  const seatNumbers = seatsData.seats.map((s) => s.seat_number.toUpperCase())
  const uniqueNumbers = new Set(seatNumbers)
  if (uniqueNumbers.size !== seatNumbers.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Duplicate seat numbers in request')
  }

  // Check if any seat numbers already exist for this bus
  const existingSeats = await seatModel.findSeatsByBusId(busId, true)
  const existingSeatNumbers = new Set(existingSeats.map((s) => s.seat_number))

  const conflicts = seatNumbers.filter((num) => existingSeatNumbers.has(num.toUpperCase()))
  if (conflicts.length > 0) {
    throw new ApiError(StatusCodes.CONFLICT, `Seat numbers already exist: ${conflicts.join(', ')}`)
  }

  return await seatModel.createSeats(busId, seatsData.seats)
}

const generateSeats = async (busId, payload, userRole, userOperatorId = null) => {
  // Check bus exists and ownership
  const bus = await ensureBusExists(busId)
  if (userRole === 'operator' && bus.operator_id !== userOperatorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only manage seats for your own buses')
  }

  const { layout, rows, seatType, startRow } = payload

  // Calculate expected seat count
  const [leftSeats, rightSeats] = layout.split('-').map(Number)
  const totalSeats = (leftSeats + rightSeats) * rows

  // Check if it exceeds bus capacity
  if (totalSeats > bus.seat_capacity) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Generated seats (${totalSeats}) would exceed bus capacity (${bus.seat_capacity})`
    )
  }

  return await seatModel.generateSeatsAuto(busId, layout, rows, seatType, startRow)
}

const listSeats = async (busId, includeInactive = false) => {
  await ensureBusExists(busId)
  return await seatModel.findSeatsByBusId(busId, includeInactive)
}

const updateSeat = async (busId, seatId, payload, userRole, userOperatorId = null) => {
  // Check bus exists and ownership
  const bus = await ensureBusExists(busId)
  if (userRole === 'operator' && bus.operator_id !== userOperatorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only manage seats for your own buses')
  }

  // Check seat exists and belongs to this bus
  const seat = await seatModel.findSeatById(seatId)
  if (!seat) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Seat not found')
  }
  if (seat.bus_id !== busId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Seat does not belong to this bus')
  }

  // If updating seat number, check it doesn't conflict
  if (payload.seat_number) {
    const existing = await seatModel.findSeatByNumber(busId, payload.seat_number)
    if (existing && existing.id !== seatId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Seat number already exists on this bus')
    }
  }

  return await seatModel.updateSeat(seatId, payload)
}

const deleteSeat = async (busId, seatId, userRole, userOperatorId = null) => {
  // Check bus exists and ownership
  const bus = await ensureBusExists(busId)
  if (userRole === 'operator' && bus.operator_id !== userOperatorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only manage seats for your own buses')
  }

  // Check seat exists and belongs to this bus
  const seat = await seatModel.findSeatById(seatId)
  if (!seat) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Seat not found')
  }
  if (seat.bus_id !== busId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Seat does not belong to this bus')
  }

  // Check if seat has bookings
  const hasBookings = await seatModel.checkSeatHasBookings(seatId)
  if (hasBookings) {
    throw new ApiError(StatusCodes.CONFLICT, 'Cannot delete seat with active bookings. Consider deactivating instead.')
  }

  await seatModel.deleteSeat(seatId)
  return { deleted: true }
}

// ============================================
// ADDITIONAL BUS SERVICES
// ============================================

const getSeatLayout = async (busId, tripId = null) => {
  await ensureBusExists(busId)
  return await seatModel.getSeatLayout(busId, tripId)
}

const getBusTrips = async (busId, filters = {}) => {
  await ensureBusExists(busId)
  return await busModel.getBusWithTrips(busId, filters)
}

const searchBuses = async (filters) => {
  return await busModel.searchBuses(filters)
}

const checkAvailability = async (busId, startDate, endDate) => {
  const bus = await busModel.getBusWithTrips(busId, { startDate, endDate })
  if (!bus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bus not found')
  }

  return {
    busId: bus.id,
    plateNumber: bus.plate_number,
    trips: bus.trips,
    hasAvailability: bus.trips.length === 0, // Simplified check
  }
}

export const busService = {
  // Bus CRUD
  createBus,
  getBus,
  listBuses,
  updateBus,
  deleteBus,

  // Seat management
  createSeats,
  generateSeats,
  listSeats,
  updateSeat,
  deleteSeat,

  // Additional
  getSeatLayout,
  getBusTrips,
  searchBuses,
  checkAvailability,
}
