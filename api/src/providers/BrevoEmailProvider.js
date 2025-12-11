import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo'
import { env } from '~/config/environment'

let emailAPI = new TransactionalEmailsApi()
emailAPI.authentications.apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (to, subject, textContent, htmlContent) => {
  let message = new SendSmtpEmail()
  message.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  }
  message.to = [{ email: to }]
  message.subject = subject
  message.textContent = textContent
  message.htmlContent = htmlContent

  return emailAPI.sendTransacEmail(message)
}

const sendETicket = async ({ to, booking, pdfBuffer }) => {
  let message = new SendSmtpEmail()
  message.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  }
  message.to = [{ email: to }]
  message.subject = `Your Bus E-Ticket - Booking #${booking.id}`
  message.textContent = `Dear customer,\nYour e-ticket is attached. Please show the QR code when boarding.`
  message.htmlContent = `<p>Dear customer,</p><p>Your e-ticket is attached. Please show the QR code when boarding.</p>`
  message.attachment = [
    {
      name: `e-ticket-${booking.id}.pdf`,
      content: pdfBuffer.toString('base64'),
    },
  ]
  return emailAPI.sendTransacEmail(message)
}

export const BrevoEmailProvider = {
  sendEmail,
  sendETicket,
}
