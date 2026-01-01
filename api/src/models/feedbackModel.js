import { GET_DB } from '~/config/prisma'

const listTripFeedbacks = async (tripId, filters = {}) => {
  const prisma = GET_DB()

  const page = Number(filters.page || 1)
  const limit = Number(filters.limit || 10)
  const skip = (page - 1) * limit

  const where = { tripId }

  const [total, feedbacks] = await Promise.all([
    prisma.feedback.count({ where }),
    prisma.feedback.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    }),
  ])

  return {
    data: feedbacks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getMyReviewContextForTrip = async (userId, tripId) => {
  const prisma = GET_DB()

  // Pick the most recent completed booking for this trip.
  const booking = await prisma.booking.findFirst({
    where: { userId, tripId, status: 'completed' },
    orderBy: { bookedAt: 'desc' },
    include: { feedback: true },
  })

  return booking
}

const upsertFeedbackForBooking = async (bookingId, data) => {
  const prisma = GET_DB()
  return prisma.feedback.upsert({
    where: { bookingId },
    create: {
      bookingId,
      tripId: data.tripId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      submittedAt: new Date(),
    },
    update: {
      rating: data.rating,
      comment: data.comment,
      submittedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
  })
}

export const feedbackModel = {
  listTripFeedbacks,
  getMyReviewContextForTrip,
  upsertFeedbackForBooking,
}
