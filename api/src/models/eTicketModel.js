import { GET_DB } from '~/config/prisma'

// Query for booking and user info for e-ticket
const getBookingForETicket = async (bookingId) => {
  const prisma = GET_DB()
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      trip: {
        include: {
          route: {
            include: {
              originStop: true,
              destinationStop: true,
            },
          },
          bus: {
            include: {
              operator: true,
            },
          },
        },
      },
      passengerDetails: {
        select: {
          fullName: true,
          documentId: true,
          seatCode: true,
        },
      },
    },
  })
}

export const eTicketModel = {
  getBookingForETicket,
}
