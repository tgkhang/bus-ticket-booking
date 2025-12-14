import { redisClient } from '~/config/redis'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const LOCK_PREFIX = 'lock:trip'
const DEFAULT_LOCK_DURATION = 60 * 10 // 10 minutes in seconds

const getLockKey = (tripId, seatId) => `${LOCK_PREFIX}:${tripId}:seat:${seatId}`

const lockSeats = async (tripId, seatIds, userId, duration = DEFAULT_LOCK_DURATION) => {
  // Check if any seat is already locked by someone else
  for (const seatId of seatIds) {
    const key = getLockKey(tripId, seatId)
    const currentLock = await redisClient.get(key)
    if (currentLock && currentLock !== userId) {
      throw new ApiError(StatusCodes.CONFLICT, `Seat ${seatId} is already locked by another user`)
    }
  }

  // Acquire locks
  const multi = redisClient.multi()
  for (const seatId of seatIds) {
    const key = getLockKey(tripId, seatId)
    multi.set(key, userId, { EX: duration })
    // Track user's locks
    multi.sAdd(`user:${userId}:locks`, key)
    multi.expire(`user:${userId}:locks`, duration) // Expire the set too, just in case
  }
  await multi.exec()
  
  return true
}

const unlockSeats = async (tripId, seatIds, userId) => {
  const multi = redisClient.multi()
  for (const seatId of seatIds) {
    const key = getLockKey(tripId, seatId)
    const currentLock = await redisClient.get(key)
    if (currentLock === userId) {
      multi.del(key)
      multi.sRem(`user:${userId}:locks`, key)
    }
  }
  await multi.exec()
}

const unlockAllUserLocks = async (userId) => {
  const userLocksKey = `user:${userId}:locks`
  const keys = await redisClient.sMembers(userLocksKey)
  
  if (keys.length > 0) {
    const multi = redisClient.multi()
    // Delete all lock keys
    for (const key of keys) {
      multi.del(key)
    }
    // Delete the user's lock set
    multi.del(userLocksKey)
    await multi.exec()
    
    // Parse keys to notify clients
    // Key format: lock:trip:{tripId}:seat:{seatId}
    const notifications = {}
    for (const key of keys) {
      const parts = key.split(':')
      const tripId = parts[2]
      const seatId = parts[4]
      
      if (!notifications[tripId]) {
        notifications[tripId] = []
      }
      notifications[tripId].push(seatId)
    }
    
    return notifications
  }
  return null
}

const extendLock = async (tripId, seatIds, userId, duration = DEFAULT_LOCK_DURATION) => {
  const multi = redisClient.multi()
  for (const seatId of seatIds) {
    const key = getLockKey(tripId, seatId)
    const currentLock = await redisClient.get(key)
    if (currentLock === userId) {
      multi.expire(key, duration)
    }
  }
  // Also extend the user's lock set
  multi.expire(`user:${userId}:locks`, duration)
  await multi.exec()
}

const getLockedSeats = async (tripId) => {
  const pattern = `${LOCK_PREFIX}:${tripId}:seat:*`
  const keys = await redisClient.keys(pattern)
  
  if (keys.length === 0) return []

  const seats = []
  for (const key of keys) {
    const seatId = key.split(':').pop()
    const userId = await redisClient.get(key)
    const ttl = await redisClient.ttl(key)
    seats.push({ seatId, userId, ttl })
  }
  return seats
}

const validateLock = async (tripId, seatIds, userId) => {
  for (const seatId of seatIds) {
    const key = getLockKey(tripId, seatId)
    const currentLock = await redisClient.get(key)
    if (currentLock && currentLock !== userId) {
      return false
    }
  }
  return true
}

export const seatLockService = {
  lockSeats,
  unlockSeats,
  extendLock,
  getLockedSeats,
  validateLock,
  unlockAllUserLocks,
  DEFAULT_LOCK_DURATION
}
