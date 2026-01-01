import { GET_DB } from '~/config/prisma'

const AUTO_CONFIRM_DELAY_MS = 300_000

const confirmPendingBookingsOlderThan = async (olderThanMs = AUTO_CONFIRM_DELAY_MS) => {
  const prisma = GET_DB()
  const cutoff = new Date(Date.now() - olderThanMs)

  // Only promote pending bookings; do not touch cancelled/completed
  const result = await prisma.booking.updateMany({
    where: {
      status: 'pending',
      bookedAt: { lte: cutoff },
    },
    data: {
      status: 'confirmed',
    },
  })

  return result.count
}

const startBookingAutoConfirmJob = (options = {}) => {
  const intervalMs = options.intervalMs ?? 60_000

  // Run immediately once, then periodically
  const tick = async () => {
    try {
      await confirmPendingBookingsOlderThan(AUTO_CONFIRM_DELAY_MS)
    } catch (err) {
      // best-effort; do not crash the server
      console.error('Auto-confirm job failed:', err)
    }
  }

  tick()
  const timer = setInterval(tick, intervalMs)

  return () => clearInterval(timer)
}

export const bookingAutoConfirmService = {
  confirmPendingBookingsOlderThan,
  startBookingAutoConfirmJob,
}
