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
}
