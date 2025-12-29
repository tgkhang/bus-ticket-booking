import { GET_DB } from '~/config/prisma'

const DEFAULT_INTERVAL_MS = 300_000

const updateTripStatusesOnce = async () => {
  const prisma = GET_DB()
  const now = new Date()

  // 1) scheduled/active -> completed when past arrivalTime
  const completed = await prisma.trip.updateMany({
    where: {
      status: { in: ['scheduled', 'active'] },
      arrivalTime: { lte: now },
    },
    data: {
      status: 'completed',
    },
  })

  // 2) scheduled -> active when past departureTime (only if staff assigned)
  // Guard with arrivalTime > now so we don't promote trips that should be completed.
  const activated = await prisma.trip.updateMany({
    where: {
      status: 'scheduled',
      departureTime: { lte: now },
      arrivalTime: { gt: now },
      staffId: { not: null },
    },
    data: {
      status: 'active',
    },
  })

  return {
    completed: completed.count,
    activated: activated.count,
  }
}

const startTripAutoStatusJob = (options = {}) => {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS

  const tick = async () => {
    try {
      await updateTripStatusesOnce()
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
