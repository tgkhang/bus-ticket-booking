/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors.js'
import { CONNECT_DB, CLOSE_DB } from '~/config/prisma.js'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

const START_SERVER = () => {
  const app = express()
  app.use(helmet())
  const hostname = env.LOCAL_DEV_APP_HOST || 'localhost'
  const PORT = env.PORT || env.LOCAL_DEV_APP_PORT || 3000

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
    // Listen on 0.0.0.0 for Render/public cloud
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`4.Production: Server is running on http://0.0.0.0:${PORT}`)
    })
  } else {
    app.listen(PORT, hostname, () => {
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
