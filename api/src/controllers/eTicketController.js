import { StatusCodes } from 'http-status-codes'
import { eTicketService } from '~/services/eTicketService'

const downloadETicket = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.jwtDecoded.id
    const pdfBuffer = await eTicketService.downloadETicket(id, userId)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=e-ticket-${id}.pdf`)
    res.status(StatusCodes.OK).send(pdfBuffer)
  } catch (error) {
    next(error)
  }
}

const sendETicketEmail = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.jwtDecoded.id
    await eTicketService.sendETicketEmail(id, userId)
    res.status(StatusCodes.OK).json({ message: 'E-ticket sent to your email.' })
  } catch (error) {
    next(error)
  }
}

// Dev only: Confirm booking and send email for guest bookings (skip payment)
const confirmAndSendEmailPublic = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.jwtDecoded?.id || null

    // Import here to avoid circular dependency
    const { bookingService } = await import('~/services/bookingService.js')
    
    // Confirm booking (mark as confirmed)
    await bookingService.confirmBooking(id, userId, {
      provider: 'dev-skip',
      transactionRef: 'dev-payment-skip',
    })

    // Send e-ticket email
    await eTicketService.sendETicketEmail(id, userId)
    
    res.status(StatusCodes.OK).json({ 
      message: 'Booking confirmed and e-ticket sent.',
      bookingId: id 
    })
  } catch (error) {
    next(error)
  }
}

export const eTicketController = {
  downloadETicket,
  sendETicketEmail,
  confirmAndSendEmailPublic,
}
