import payOS from '../providers/PayOSProvider.js'
import { env } from '../config/environment.js'

const registerWebhook = async () => {
  try {
    // Determine the API domain based on build mode
    const API_DOMAIN = env.BUILD_MODE === 'production'
      ? env.API_DOMAIN_PRODUCTION
      : env.API_DOMAIN_DEVELOPMENT

    const webhookUrl = `${API_DOMAIN}/api/v1/payment/webhook`

    console.log('Registering webhook URL:', webhookUrl)

    const result = await payOS.webhooks.confirm(webhookUrl)

    console.log('✅ Webhook registered successfully!')
    console.log('Result:', result)
    console.log('\nPayOS will now send payment notifications to:', webhookUrl)
  } catch (error) {
    console.error('❌ Failed to register webhook:', error.message)
    console.error('Error details:', error)
  }
}

registerWebhook()
