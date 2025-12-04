import { GET_DB } from '~/config/prisma'

// ============================================
// SEAT CRUD OPERATIONS
// ============================================

const createSeats = async (busId, seats) => {
  try {
    const prisma = GET_DB()

    return await prisma.$transaction(async (tx) => {
      // Create all seats
      const createdSeats = await tx.seat.createMany({
        data: seats.map((seat) => ({
          busId: busId,
          seatNumber: seat.seatNumber.toUpperCase(),
          seatType: seat.seatType || 'regular',
          isActive: seat.isActive !== undefined ? seat.isActive : true,
        })),
      })

      // Fetch and return created seats
      return await tx.seat.findMany({
        where: { busId: busId },
        orderBy: { seatNumber: 'asc' },
      })
    })
  } catch (error) {
    throw new Error(error)
  }
}

const generateSeatsAuto = async (busId, layout, rows, seatType = 'regular', startRow = 1) => {
  try {
    const prisma = GET_DB()

    // Parse layout (e.g., "2-2" means 2 seats on left, 2 on right)
    const [leftSeats, rightSeats] = layout.split('-').map(Number)
    const columns = ['A', 'B', 'C', 'D', 'E', 'F']

    const seats = []

    for (let row = startRow; row < startRow + rows; row++) {
      let colIndex = 0

      // Left side seats
      for (let i = 0; i < leftSeats; i++) {
        seats.push({
          seatNumber: `${columns[colIndex]}${row}`,
          seatType,
          isActive: true,
        })
        colIndex++
      }

      // Skip column for aisle
      // colIndex++

      // Right side seats
      for (let i = 0; i < rightSeats; i++) {
        seats.push({
          seatNumber: `${columns[colIndex]}${row}`,
          seatType,
          isActive: true,
        })
        colIndex++
      }
    }

    return await createSeats(busId, seats)
  } catch (error) {
    throw new Error(error)
  }
}

const findSeatsByBusId = async (busId, includeInactive = false) => {
  try {
    const prisma = GET_DB()

    const where = { busId: busId }
    if (!includeInactive) {
      where.isActive = true
    }

    return await prisma.seat.findMany({
      where,
      orderBy: { seatNumber: 'asc' },
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findSeatById = async (seatId) => {
  try {
    const prisma = GET_DB()
    return await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        bus: true,
      },
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findSeatByNumber = async (busId, seatNumber) => {
  try {
    const prisma = GET_DB()
    return await prisma.seat.findUnique({
      where: {
        busId_seatNumber: {
          busId: busId,
          seatNumber: seatNumber.toUpperCase(),
        },
      },
    })
  } catch (error) {
    throw new Error(error)
  }
}

const updateSeat = async (seatId, data) => {
  try {
    const prisma = GET_DB()

    const updateData = {}
    if (data.seatNumber) updateData.seatNumber = data.seatNumber.toUpperCase()
    if (data.seatType) updateData.seatType = data.seatType
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    return await prisma.seat.update({
      where: { id: seatId },
      data: updateData,
    })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteSeat = async (seatId) => {
  try {
    const prisma = GET_DB()
    return await prisma.seat.delete({
      where: { id: seatId },
    })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteAllSeats = async (busId) => {
  try {
    const prisma = GET_DB()
    return await prisma.seat.deleteMany({
      where: { busId: busId },
    })
  } catch (error) {
    throw new Error(error)
  }
}

// ============================================
// SEAT-SPECIFIC QUERIES
// ============================================

const checkSeatHasBookings = async (seatId) => {
  try {
    const prisma = GET_DB()
    const count = await prisma.seatStatus.count({
      where: {
        seatId: seatId,
        status: { in: ['locked', 'booked'] },
      },
    })
    return count > 0
  } catch (error) {
    throw new Error(error)
  }
}

const getSeatLayout = async (busId, tripId = null) => {
  try {
    const prisma = GET_DB()

    const seats = await prisma.seat.findMany({
      where: {
        busId: busId,
        isActive: true,
      },
      orderBy: { seatNumber: 'asc' },
    })

    // If tripId provided, get seat availability for that trip
    if (tripId) {
      const seatStatuses = await prisma.seatStatus.findMany({
        where: {
          tripId: tripId,
          seatId: { in: seats.map((s) => s.id) },
        },
      })

      // Map status to each seat
      const statusMap = {}
      seatStatuses.forEach((ss) => {
        statusMap[ss.seatId] = {
          status: ss.status,
          lockedUntil: ss.lockedUntil,
        }
      })

      return seats.map((seat) => ({
        ...seat,
        availability: statusMap[seat.id] || { status: 'available' },
      }))
    }

    return seats
  } catch (error) {
    throw new Error(error)
  }
}

const countSeatsByType = async (busId) => {
  try {
    const prisma = GET_DB()

    const counts = await prisma.seat.groupBy({
      by: ['seatType'],
      where: {
        busId: busId,
        isActive: true,
      },
      _count: true,
    })

    return counts.reduce((acc, item) => {
      acc[item.seatType] = item._count
      return acc
    }, {})
  } catch (error) {
    throw new Error(error)
  }
}

export const seatModel = {
  createSeats,
  generateSeatsAuto,
  findSeatsByBusId,
  findSeatById,
  findSeatByNumber,
  updateSeat,
  deleteSeat,
  deleteAllSeats,
  checkSeatHasBookings,
  getSeatLayout,
  countSeatsByType,
}
