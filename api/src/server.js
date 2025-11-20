/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors.js'
import { CONNECT_DB, CLOSE_DB } from '~/config/prisma.js'
//import cookieParser from 'cookie-parser'

const START_SERVER = () => {
  const app = express()
  const hostname = env.LOCAL_DEV_APP_HOST || 'localhost'
  const PORT = env.LOCAL_DEV_APP_PORT || 3000

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  //app.use(cookieParser()) // Enable cookie parsing middleware
  app.use(cors(corsOptions)) // Enable CORS for all routes by default

  // Middleware to parse JSON request bodies, enable request json body data
  app.use(express.json())
  app.use('/v1', APIs_V1)

  // Middleware for handling errors globally
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    app.listen(env.PORT, () => {
      console.log(`3.Production: Server is running at ${env.PORT}`)
    })
  } else {
    app.listen(PORT, hostname, () => {
      console.log(`3.Local: Server is running on http://${hostname}:${PORT}`)
    })
  }

  // Cleanup tasks before exit application
  exitHook(async (callback) => {
    console.log('\n4.Exiting application, closing DB connection...')
    await CLOSE_DB()
    console.log('5.PostgreSQL connection closed.')
    callback()
  })
}

// Using async/await syntax IIFE
;(async () => {
  try {
    console.log('1.Connecting to PostgreSQL DB...')
    await CONNECT_DB()
    console.log('2.Connected to PostgreSQL DB successfully!')
    START_SERVER()
  } catch (error) {
    console.error('Error connecting to DB:', error)
    process.exit(1)
  }
})()
