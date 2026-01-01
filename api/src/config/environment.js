// This file loads environment variables from a .env file and exports them for use in the application.
// Everytime need to use env variables, just import { env } from '~/config/environment.js'
import 'dotenv/config'

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Server
  LOCAL_DEV_APP_HOST: process.env.LOCAL_DEV_APP_HOST,
  LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT,
  BUILD_MODE: process.env.BUILD_MODE,
  PORT: process.env.PORT,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  WEBSITE_DOMAIN_DEVELOPMENT: process.env.WEBSITE_DOMAIN_DEVELOPMENT,
  WEBSITE_DOMAIN_PRODUCTION: process.env.WEBSITE_DOMAIN_PRODUCTION,
  API_DOMAIN_DEVELOPMENT: process.env.API_DOMAIN_DEVELOPMENT,
  API_DOMAIN_PRODUCTION: process.env.API_DOMAIN_PRODUCTION,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  ADMIN_EMAIL_ADDRESS: process.env.ADMIN_EMAIL_ADDRESS,
  ADMIN_EMAIL_NAME: process.env.ADMIN_EMAIL_NAME,

  ACCESS_JWT_SECRET_KEY: process.env.ACCESS_JWT_SECRET_KEY,
  ACCESS_JWT_EXPIRES_IN: process.env.ACCESS_JWT_EXPIRES_IN,

  REFRESH_JWT_SECRET_KEY: process.env.REFRESH_JWT_SECRET_KEY,
  REFRESH_JWT_EXPIRES_IN: process.env.REFRESH_JWT_EXPIRES_IN,

  PAYOS_API_KEY: process.env.PAYOS_API_KEY,
  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL,

  WEB_URL: process.env.WEB_URL,
}
