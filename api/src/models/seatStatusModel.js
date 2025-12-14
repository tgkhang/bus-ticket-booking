import { GET_DB } from '~/config/prisma'

const getSeatStatusesByTripId = async (tripId) => {
  const prisma = GET_DB()
  return prisma.seatStatus.findMany({
    where: { tripId },
    include: {
      seat: true,
    },
  })
}

const lockSeats = async (tripId, seatIds, lockDuration = 10) => {
  const prisma = GET_DB()
  const lockedUntil = new Date(Date.now() + lockDuration * 60 * 1000) // lockDuration in minutes

  const updates = seatIds.map((seatId) =>
    prisma.seatStatus.updateMany({
      where: {
        tripId,
        seatId,
        status: 'available',
      },
      data: {
        status: 'locked',
        lockedUntil,
      },
    })
  )

  await prisma.$transaction(updates)
  return lockedUntil
}

const unlockSeats = async (tripId, seatIds) => {
  const prisma = GET_DB()
  await prisma.seatStatus.updateMany({
    where: {
      tripId,
      seatId: { in: seatIds },
      status: 'locked',
    },
    data: {
      status: 'available',
      lockedUntil: null,
    },
  })
}

const bookSeats = async (tripId, seatIds) => {
  const prisma = GET_DB()
  await prisma.seatStatus.updateMany({
    where: {
      tripId,
      seatId: { in: seatIds },
      status: 'locked',
    },
    data: {
      status: 'booked',
      lockedUntil: null,
    },
  })
}

const releaseExpiredLocks = async () => {
  const prisma = GET_DB()
  await prisma.seatStatus.updateMany({
    where: {
      status: { in: ['locked', 'booked'] },
      lockedUntil: {
        lt: new Date(),
        not: null
      },
    },
    data: {
      status: 'available',
      lockedUntil: null,
    },
  })
}

const checkSeatsAvailability = async (tripId, seatIds) => {
  const prisma = GET_DB()
  const seatStatuses = await prisma.seatStatus.findMany({
    where: {
      tripId,
      seatId: { in: seatIds },
    },
  })

  const availableSeats = seatStatuses.filter((s) => s.status === 'available' || s.status === 'locked')
  return availableSeats.length === seatIds.length
}

const getAvailableSeatsCount = async (tripId) => {
  const prisma = GET_DB()
  const count = await prisma.seatStatus.count({
    where: {
      tripId,
      status: 'available',
    },
  })
  return count
}

export const seatStatusModel = {
  getSeatStatusesByTripId,
  lockSeats,
  unlockSeats,
  bookSeats,
  releaseExpiredLocks,
  checkSeatsAvailability,
  getAvailableSeatsCount,
}
