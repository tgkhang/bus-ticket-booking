/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors.js'
import { CONNECT_DB, CLOSE_DB } from '~/config/prisma.js'
import { connectRedis } from '~/config/redis.js'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import { seatLockService } from '~/services/seatLockService'
import jwt from 'jsonwebtoken'

const START_SERVER = async () => {
  await connectRedis()
  const app = express()
  const httpServer = createServer(app)
  const io = new Server(httpServer, {
    cors: corsOptions,
  })

  io.on('connection', (socket) => {
    // console.log('New client connected:', socket.id)
    
    // Try to identify user from token if present in handshake auth or cookies
    let token = socket.handshake.auth?.token

    // If no token in auth, try to get from cookies
    if (!token && socket.request.headers.cookie) {
      try {
        const cookies = socket.request.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {})
        token = cookies['accessToken']
      } catch (e) {
        // console.log('Error parsing cookies:', e)
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET)
        socket.userId = decoded.id
        // console.log('User identified:', socket.userId)
      } catch (err) {
        // console.log('Socket auth failed:', err.message)
      }
    }

    socket.on('disconnect', async () => {
      // console.log('Client disconnected:', socket.id)
      if (socket.userId) {
        try {
          const unlocked = await seatLockService.unlockAllUserLocks(socket.userId)
          if (unlocked) {
            // Notify others about unlocked seats
            Object.keys(unlocked).forEach(tripId => {
              socket.broadcast.emit('seats:unlocked', { 
                tripId, 
                seatIds: unlocked[tripId] 
              })
            })
          }
        } catch (err) {
          console.error('Error unlocking seats on disconnect:', err)
        }
      }
    })
  })

  app.use((req, res, next) => {
    req.io = io
    next()
  })

  app.use(helmet())
  const hostname = env.LOCAL_DEV_APP_HOST || 'localhost'
  const PORT = env.LOCAL_DEV_APP_PORT || 3000

  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(express.json())

  // Swagger UI Documentation
  // try {
  //   const swaggerDocument = YAML.load(path.join(__dirname, '../openapi/openapi.yaml'))
  //   app.use(
  //     '/api-docs',
  //     swaggerUi.serve,
  //     swaggerUi.setup(swaggerDocument, {
  //       customCss: '.swagger-ui .topbar { display: none }',
  //       customSiteTitle: 'Bus Ticket Booking API Docs',
  //     })
  //   )
  //   console.log('3.Swagger UI available at /api-docs')
  // } catch (error) {
  //   console.warn('Warning: Could not load OpenAPI spec. Swagger UI will not be available.', error.message)
  // }

  app.use('/v1', APIs_V1)
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    httpServer.listen(env.PORT, () => {
      console.log(`4.Production: Server is running at ${env.PORT}`)
    })
  } else {
    httpServer.listen(PORT, hostname, () => {
      console.log(`4.Local: Server is running on http://${hostname}:${PORT}`)
    })
  }

  exitHook(async (callback) => {
    console.log('\n5.Exiting application, closing DB connection...')
    await CLOSE_DB()
    console.log('6.PostgreSQL connection closed.')
    callback()
  })
}

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
