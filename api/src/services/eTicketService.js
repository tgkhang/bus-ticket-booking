import { eTicketModel } from '~/models/eTicketModel'
import { BrevoEmailProvider } from '~/providers/BrevoEmailProvider'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { env } from '~/config/environment'

// Generate e-ticket PDF with QR code
const generateETicketPDF = async (booking) => {
  const doc = new PDFDocument({ size: 'A5', margin: 30, layout: 'landscape' })
  const buffers = []
  doc.on('data', buffers.push.bind(buffers))

  // Register Vietnamese font
  const fontPath = require('path').resolve(__dirname, '../../fonts/DejaVuSans.ttf')
  if (require('fs').existsSync(fontPath)) {
    doc.registerFont('DejaVuSans', fontPath)
    doc.font('DejaVuSans')
  } else {
    console.log('Font file not found:', fontPath)
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Title
      const titleFontSize = 24;
      const titleY = doc.options.margin + 5;
      doc.fillColor('#1976d2').fontSize(titleFontSize).text('BusBooking E-Ticket', 0, titleY, {
        width: doc.page.width,
        align: 'center',
      });
      // Draw a thin line under the title
      const lineY = titleY + titleFontSize + 4;
      doc.moveTo(doc.options.margin, lineY)
         .lineTo(doc.page.width - doc.options.margin, lineY)
         .lineWidth(1)
         .strokeColor('#e0e0e0')
         .stroke();

      // QR code section
      const qrSize = 110;
      const qrX = doc.page.width - doc.options.margin - qrSize;
      const qrY = lineY + 30;
      // Text hướng dẫn QR code
      doc.fillColor('#343a40').fontSize(11).text('Scan for', qrX, qrY - 25, { width: qrSize, align: 'center' });
      doc.text('Verification', qrX, qrY - 13, { width: qrSize, align: 'center' });
      const domain = env.BUILD_MODE === 'dev' ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION;
      const qrUrl = `${domain}/admin/verify-ticket?bookingId=${booking.id}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);
      const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(qrBase64, 'base64');
      doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });
      doc.fillColor('#6c757d').fontSize(10).text('Scan at boarding (admin only)', qrX, qrY + qrSize + 4, { width: qrSize, align: 'center' });

      // Left column content
      const leftX = doc.options.margin;
      let y = lineY + 16;
      // Route Details
      doc.fillColor('#343a40').fontSize(16).text('Route Details', leftX, y);
      y = doc.y;
      doc.fillColor('#6c757d').fontSize(12);
      doc.text(`Route: ${booking.trip.route.originStop.name} → ${booking.trip.route.destinationStop.name}`, leftX, y);
      doc.text(`Date: ${new Date(booking.trip.departureTime).toLocaleDateString()}`, leftX);
      doc.text(`Departure: ${new Date(booking.trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, leftX);
      doc.text(`Arrival: ${new Date(booking.trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, leftX);
      doc.text(`Bus: ${booking.trip.bus.model}`, leftX);
      doc.text(`Operator: ${booking.trip.bus.operator?.name || ''}`, leftX);
      doc.moveDown(1);

      // Passenger Details
      doc.fillColor('#343a40').fontSize(16).text('Passenger Details', leftX);
      y = doc.y;
      doc.save();
      const boxWidth = 320;
      const boxHeight = booking.passengerDetails.length * 18 + 10;
      doc.rect(leftX, y, boxWidth, boxHeight).fill('#f5f5f5');
      doc.restore();
      doc.y = y + 5;
      doc.fillColor('#495057').fontSize(12);
      booking.passengerDetails.forEach((p, idx) => {
        doc.text(`Full Name: ${p.fullName} (ID: ${p.documentId}) - Seat: ${p.seatCode}`, leftX + 8);
      });
      doc.moveDown(1);

      // Total Paid
      doc.fillColor('#28a745').fontSize(18).text(`Total Paid: ${booking.totalAmount} VND`, leftX);

      // Footer
      const footerText = 'Thank you for booking! Have a safe journey.';
      const footerFontSize = 11;
      const footerY = doc.page.height - doc.options.margin - 20;
      doc.fillColor('#adb5bd').fontSize(footerFontSize);
      doc.text(footerText, doc.options.margin, footerY, {
        width: doc.page.width - doc.options.margin * 2,
        align: 'center',
        lineBreak: false
      });

      doc.end()
      doc.on('end', () => {
        resolve(Buffer.concat(buffers))
      })
    } catch (err) {
      reject(err)
    }
  })
}

const downloadETicket = async (bookingId, userId) => {
  const booking = await eTicketModel.getBookingForETicket(bookingId)
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }
  // Skip user ownership check for testing when userId is not provided
  if (userId && booking.userId !== userId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found or access denied')
  }
  return generateETicketPDF(booking)
}

const sendETicketEmail = async (bookingId, userId) => {
  console.log('====== SEND E-TICKET EMAIL ======')
  console.log('BookingId:', bookingId)
  console.log('UserId:', userId)

  const booking = await eTicketModel.getBookingForETicket(bookingId)
  if (!booking) {
    console.error('✗ Booking not found for e-ticket:', bookingId)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found')
  }
  console.log('✓ Booking found for e-ticket')

  // Skip user ownership check for testing when userId is not provided
  if (userId && booking.userId !== userId) {
    console.error('✗ User does not own this booking')
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found or access denied')
  }

  const toEmail = booking?.user?.email || booking?.guestEmail
  console.log('Recipient email:', toEmail)

  if (!toEmail) {
    console.error('✗ No email found for this booking')
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found for this booking')
  }

  console.log('Generating PDF...')
  const pdfBuffer = await generateETicketPDF(booking)
  console.log('✓ PDF generated, size:', pdfBuffer.length, 'bytes')

  console.log('Sending email via Brevo...')
  await BrevoEmailProvider.sendETicket({
    to: toEmail,
    booking,
    pdfBuffer,
  })
  console.log('✓ Email sent successfully to:', toEmail)

  return { success: true }
}

export const eTicketService = {
  downloadETicket,
  sendETicketEmail,
}
