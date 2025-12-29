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
import morgan from 'morgan'
import passport from '~/config/passport'
import { seatLockService } from '~/services/seatLockService'
import { bookingAutoConfirmService } from '~/services/bookingAutoConfirmService'
import jwt from 'jsonwebtoken'

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex)
    if (key !== name) continue
    return trimmed.slice(eqIndex + 1)
  }
  return null
}

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
    if (!token) {
      token = getCookieValue(socket.request.headers.cookie, 'accessToken')
    }
    
    console.log('Socket connected. Auth token:', token ? 'Present' : 'Missing');
    if (token) {
      try {
        const decoded = jwt.verify(token, env.ACCESS_JWT_SECRET_KEY)
        socket.userId = decoded.id
        console.log('User identified:', socket.userId)
      } catch (err) {
        console.log('Socket auth failed:', err.message)
      }
    }

    if (socket.userId) {
      seatLockService.registerUserSocket(socket.userId, socket.id).catch((err) => {
        console.error('Error registering user socket:', err)
      })
    }

    // Chatbot socket logic
    socket.on('message', async (msg) => {
      console.log('Chat message received. userId:', socket.userId || 'Not authenticated');
      try {
        // Import controller here to avoid circular deps
        const { chatController } = await import('./controllers/chatController.js');
        
        // Compose a fake req/res for controller
        const fakeReq = { 
          body: { 
            message: msg.text, 
            userId: socket.userId,
            history: msg.history || [],
            sessionId: msg.sessionId || null
          } 
        };
        
        let chatResponse = null;
        const fakeRes = {
          status: () => fakeRes,
          json: (data) => {
            chatResponse = data;
          }
        };
        
        const fakeNext = (error) => {
          console.error('Chat socket error:', error);
          socket.emit('message', { 
            sender: 'AI', 
            text: 'Sorry, an error occurred. Please try again.',
            timestamp: new Date() 
          });
        };
        
        await chatController.handleChat(fakeReq, fakeRes, fakeNext);
        
        if (chatResponse) {
          socket.emit('message', { 
            sender: 'AI', 
            text: chatResponse.reply,
            intent: chatResponse.intent,
            data: chatResponse.data,
            timestamp: new Date() 
          });
        }
      } catch (err) {
        console.error('Chat socket error:', err);
        socket.emit('message', { 
          sender: 'AI', 
          text: 'Sorry, an error occurred. Please try again.',
          timestamp: new Date() 
        });
      }
    });

    socket.on('disconnect', async () => {
      // console.log('Client disconnected:', socket.id)
      if (socket.userId) {
        try {
          const remainingSockets = await seatLockService.unregisterUserSocket(socket.userId, socket.id)
          
          // Only unlock when the user has no other active sockets (multi-tab safe)
          if (remainingSockets === 0) {
            const unlocked = await seatLockService.unlockAllUserLocks(socket.userId)
            if (unlocked) {
              Object.keys(unlocked).forEach((tripId) => {
                socket.broadcast.emit('seats:unlocked', {
                  tripId,
                  seatIds: unlocked[tripId],
                })
              })
            }
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

  // Morgan logging middleware - shows HTTP requests in color
  if (env.BUILD_MODE === 'development') {
    app.use(morgan('dev')) // Colored output for development
  } else {
    app.use(morgan('combined')) // Standard Apache-style logs for production
  }

  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(passport.initialize())

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

  // Background job: auto-confirm pending bookings after 5 minute with the check every 2 minutes
  bookingAutoConfirmService.startBookingAutoConfirmJob({ intervalMs: 120_000 })

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
