import { StatusCodes } from 'http-status-codes'
import payOS from '~/providers/PayOSProvider.js'
import { env } from '~/config/environment.js'
import { GET_DB } from '~/config/prisma'
import { bookingService } from '~/services/bookingService'
import { eTicketService } from '~/services/eTicketService'

const createPaymentLink = async (req, res, next) => {
  const { description, items, bookingId } = req.body

  const prisma = GET_DB()
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (!booking) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Booking not found',
    })
  }

  // Enforce ownership for authenticated users
  if (booking.userId !== req.jwtDecoded?.id) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to pay for this booking',
    })
  }

  if (booking.status !== 'pending') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Booking is not payable (status: ${booking.status})`,
    })
  }

  const amount = Number(booking.totalAmount)

  // Determine the domain based on build mode
  const YOUR_DOMAIN = env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

  // Generate unique order code (6 digits, positive integer)
  const orderCode = Number(String(Date.now()).slice(-6))

  // PayOS description max length is 25 characters
  const truncatedDescription = (description || 'Thanh toan ve xe').substring(0, 25)

  const body = {
    orderCode,
    amount,
    description: truncatedDescription,
    items: items || [
      {
        name: 'Ve xe',
        quantity: 1,
        price: amount,
      },
    ],
    returnUrl: `${YOUR_DOMAIN}/payment/success?bookingId=${bookingId || ''}&orderCode=${orderCode}`,
    cancelUrl: `${YOUR_DOMAIN}/payment/cancel?bookingId=${bookingId || ''}&orderCode=${orderCode}`,
  }

  // Use paymentRequests.create() method from PayOS SDK
  const paymentLinkResponse = await payOS.paymentRequests.create(body)

  // Create payment record to store orderCode → bookingId mapping
  await prisma.payment.create({
    data: {
      bookingId,
      provider: 'payos',
      transactionRef: String(orderCode),
      amount: booking.totalAmount,
      status: 'pending',
    },
  })

  res.status(StatusCodes.CREATED).json({
    success: true,
    checkoutUrl: paymentLinkResponse.checkoutUrl,
    orderCode: paymentLinkResponse.orderCode,
    paymentLinkId: paymentLinkResponse.paymentLinkId,
  })
}

const createPaymentLinkPublic = async (req, res, next) => {
  const { description, items, bookingId, referenceCode, token } = req.body

  // Validate guest access
  const booking = await bookingService.getBookingPublicByReference(referenceCode, token)
  if (booking.id !== bookingId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Booking reference does not match bookingId',
    })
  }

  if (booking.status !== 'pending') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Booking is not payable (status: ${booking.status})`,
    })
  }

  // Determine the domain based on build mode
  const YOUR_DOMAIN = env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT
  const orderCode = Number(String(Date.now()).slice(-6))
  const truncatedDescription = (description || 'Thanh toan ve xe').substring(0, 25)
  const amount = Number(booking.totalAmount)

  const body = {
    orderCode,
    amount,
    description: truncatedDescription,
    items: items || [
      {
        name: 'Ve xe',
        quantity: 1,
        price: amount,
      },
    ],
    returnUrl: `${YOUR_DOMAIN}/payment/success?bookingId=${bookingId || ''}&orderCode=${orderCode}`,
    cancelUrl: `${YOUR_DOMAIN}/payment/cancel?bookingId=${bookingId || ''}&orderCode=${orderCode}`,
  }

  const paymentLinkResponse = await payOS.paymentRequests.create(body)

  // Create payment record to store orderCode → bookingId mapping
  const prisma = GET_DB()
  await prisma.payment.create({
    data: {
      bookingId,
      provider: 'payos',
      transactionRef: String(orderCode),
      amount: booking.totalAmount,
      status: 'pending',
    },
  })

  res.status(StatusCodes.CREATED).json({
    success: true,
    checkoutUrl: paymentLinkResponse.checkoutUrl,
    orderCode: paymentLinkResponse.orderCode,
    paymentLinkId: paymentLinkResponse.paymentLinkId,
  })
}

const getPaymentLinkInformation = async (req, res, next) => {
  const { orderCode } = req.params

  // Use paymentRequests.get() method from PayOS SDK
  const paymentInfo = await payOS.paymentRequests.get(Number(orderCode))

  res.status(StatusCodes.OK).json({
    success: true,
    data: paymentInfo,
  })
}

const confirmWebhook = async (req, res, next) => {
  const webhookData = req.body

  try {
    console.log('====== WEBHOOK RECEIVED ======')
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2))

    // Verify webhook signature using PayOS SDK
    const verifiedData = await payOS.webhooks.verify(webhookData)
    console.log('✓ Webhook signature verified')
    console.log('Verified data:', JSON.stringify(verifiedData, null, 2))

    // Find payment record by orderCode (stored in transactionRef)
    const prisma = GET_DB()
    const payment = await prisma.payment.findUnique({
      where: { transactionRef: String(verifiedData.orderCode) },
      include: { booking: true },
    })

    if (!payment) {
      console.error('✗ Payment not found for orderCode:', verifiedData.orderCode)
      return res.status(StatusCodes.OK).json({
        success: false,
        message: 'Payment record not found',
      })
    }

    console.log('✓ Payment record found:', payment.id)
    console.log('Payment status:', payment.status)

    const bookingId = payment.bookingId
    const booking = payment.booking

    if (!booking) {
      console.error('✗ Booking not found:', bookingId)
      return res.status(StatusCodes.OK).json({
        success: false,
        message: 'Booking not found',
      })
    }

    console.log('✓ Booking found:', bookingId)
    console.log('Booking status:', booking.status)
    console.log('Booking userId:', booking.userId)
    console.log('Booking email:', booking.guestEmail || 'N/A')

    // Process based on payment status
    if (verifiedData.code === '00' && verifiedData.status === 'PAID') {
      console.log('Processing PAID webhook...')

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      })
      console.log('✓ Payment status updated to completed')

      // Payment successful - confirm booking
      console.log('Confirming booking...')
      await bookingService.confirmBooking(bookingId, booking.userId, {
        provider: 'payos',
        transactionRef: String(verifiedData.orderCode),
      })
      console.log('✓ Booking confirmed successfully:', bookingId)

      // Send e-ticket email (idempotent - won't fail if already sent)
      try {
        console.log('Sending e-ticket email...')
        await eTicketService.sendETicketEmail(bookingId, booking.userId || null)
        console.log('✓ E-ticket email sent successfully:', bookingId)
      } catch (emailError) {
        console.error('✗ Failed to send e-ticket email:', emailError.message)
        console.error('Email error stack:', emailError.stack)
        // Don't fail the webhook if email fails - booking is already confirmed
      }
    } else if (verifiedData.code === '01' && verifiedData.status === 'CANCELLED') {
      console.log('Processing CANCELLED webhook...')

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          processedAt: new Date(),
        },
      })
      console.log('✓ Payment status updated to failed')

      // Payment cancelled - cancel booking and release seats
      console.log('Cancelling booking...')
      await bookingService.cancelBooking(bookingId, booking.userId)
      console.log('✓ Booking cancelled successfully:', bookingId)
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Webhook processed successfully',
      data: verifiedData,
    })
  } catch (error) {
    console.error('Webhook processing error:', error)

    // Always return 200 to PayOS to prevent retries for invalid webhooks
    res.status(StatusCodes.OK).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message,
    })
  }
}

// Dev: Manual webhook trigger (bypass PayOS webhook call)
const devConfirmBooking = async (req, res, next) => {
  try {
    console.log('====== DEV CONFIRM BOOKING ======')
    const { bookingId, orderCode } = req.body
    console.log('Request:', { bookingId, orderCode })

    if (!bookingId || !orderCode) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'bookingId and orderCode are required',
      })
    }

    const prisma = GET_DB()
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      console.error('✗ Booking not found:', bookingId)
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Booking not found',
      })
    }

    console.log('✓ Booking found:', bookingId)
    console.log('Booking status:', booking.status)
    console.log('Booking userId:', booking.userId)

    // Confirm booking
    console.log('Confirming booking...')
    await bookingService.confirmBooking(bookingId, booking.userId, {
      provider: 'payos',
      transactionRef: String(orderCode),
    })
    console.log('✓ [DEV] Booking confirmed successfully:', bookingId)

    // Send e-ticket email
    try {
      console.log('Sending e-ticket email...')
      await eTicketService.sendETicketEmail(bookingId, booking.userId || null)
      console.log('✓ [DEV] E-ticket email sent successfully:', bookingId)
    } catch (emailError) {
      console.error('✗ [DEV] Failed to send e-ticket email:', emailError.message)
      console.error('Email error stack:', emailError.stack)
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Booking confirmed and email sent (dev mode)',
      bookingId,
    })
  } catch (error) {
    console.error('✗ [DEV] Error in devConfirmBooking:', error.message)
    console.error('Error stack:', error.stack)
    next(error)
  }
}

export const paymentController = {
  createPaymentLink,
  createPaymentLinkPublic,
  getPaymentLinkInformation,
  confirmWebhook,
  devConfirmBooking,
}
