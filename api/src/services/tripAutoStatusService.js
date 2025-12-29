import { GET_DB } from '~/config/prisma'

const DEFAULT_INTERVAL_MS = 300_000

const emitTripStatusUpdated = (io, tripId, status) => {
  if (!io) return
  io.emit('trip:statusUpdated', { tripId, status })
}

const updateTripStatusesOnce = async (options = {}) => {
  const prisma = GET_DB()
  const io = options.io
  const now = new Date()

  // 1) scheduled/active -> completed when past arrivalTime
  const tripsToComplete = await prisma.trip.findMany({
    where: {
      status: { in: ['scheduled', 'active'] },
      arrivalTime: { lte: now },
    },
    select: { id: true },
  })

  const completed = await prisma.trip.updateMany({
    where: {
      id: { in: tripsToComplete.map((t) => t.id) },
    },
    data: {
      status: 'completed',
    },
  })

  tripsToComplete.forEach((t) => emitTripStatusUpdated(io, t.id, 'completed'))

  // 2) scheduled -> active when past departureTime (only if staff assigned)
  // Guard with arrivalTime > now so we don't promote trips that should be completed.
  const tripsToActivate = await prisma.trip.findMany({
    where: {
      status: 'scheduled',
      departureTime: { lte: now },
      arrivalTime: { gt: now },
      staffId: { not: null },
    },
    select: { id: true },
  })

  const activated = await prisma.trip.updateMany({
    where: {
      id: { in: tripsToActivate.map((t) => t.id) },
    },
    data: {
      status: 'active',
    },
  })

  tripsToActivate.forEach((t) => emitTripStatusUpdated(io, t.id, 'active'))

  return {
    completed: completed.count,
    activated: activated.count,
  }
}

const startTripAutoStatusJob = (options = {}) => {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS
  const io = options.io

  const tick = async () => {
    try {
      await updateTripStatusesOnce({ io })
    } catch (err) {
      // best-effort; do not crash the server
      console.error('Trip auto-status job failed:', err)
    }
  }

  tick()
  const timer = setInterval(tick, intervalMs)

  return () => clearInterval(timer)
}

export const tripAutoStatusService = {
  updateTripStatusesOnce,
  startTripAutoStatusJob,
}
