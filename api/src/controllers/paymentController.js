import { StatusCodes } from 'http-status-codes'
import payOS from '~/providers/PayOSProvider.js'
import { env } from '~/config/environment.js'
import { GET_DB } from '~/config/prisma'
import { bookingService } from '~/services/bookingService'

const createPaymentLink = async (req, res, next) => {
  const { amount, description, items, bookingId } = req.body

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
    // Verify webhook signature using PayOS SDK
    const verifiedData = await payOS.webhooks.verify(webhookData)

    console.log('Webhook verified:', verifiedData)

    // Find booking by orderCode stored in description or custom field
    // Since PayOS doesn't have a built-in bookingId field, we need to find it from the return URL
    const prisma = GET_DB()
    const paymentInfo = await payOS.paymentRequests.get(verifiedData.orderCode)

    // Extract bookingId from returnUrl or cancelUrl
    const returnUrl = paymentInfo.returnUrl || ''
    const bookingIdMatch = returnUrl.match(/bookingId=([^&]+)/)
    const bookingId = bookingIdMatch ? bookingIdMatch[1] : null

    if (!bookingId) {
      console.error('Could not extract bookingId from webhook data')
      return res.status(StatusCodes.OK).json({
        success: false,
        message: 'BookingId not found in webhook data',
      })
    }

    // Get booking to find userId
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      console.error('Booking not found:', bookingId)
      return res.status(StatusCodes.OK).json({
        success: false,
        message: 'Booking not found',
      })
    }

    // Process based on payment status
    if (verifiedData.code === '00' && verifiedData.status === 'PAID') {
      // Payment successful - confirm booking
      await bookingService.confirmBooking(bookingId, booking.userId, {
        provider: 'payos',
        transactionRef: String(verifiedData.orderCode),
      })

      console.log('Booking confirmed via webhook:', bookingId)
    } else if (verifiedData.code === '01' && verifiedData.status === 'CANCELLED') {
      // Payment cancelled - cancel booking and release seats
      await bookingService.cancelBooking(bookingId, booking.userId)

      console.log('Booking cancelled via webhook:', bookingId)
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

export const paymentController = {
  createPaymentLink,
  getPaymentLinkInformation,
  confirmWebhook,
}
