import 'dotenv/config'
import { createClient } from 'redis'

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
  },
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))

const connectRedis = async () => {
  if (!redisClient.isOpen) { 
    await redisClient.connect()
    console.log('Connected to Redis')
  }
}

export { redisClient, connectRedis }
