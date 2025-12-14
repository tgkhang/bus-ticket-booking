import { StatusCodes } from 'http-status-codes'
import { seatLockService } from '~/services/seatLockService'

const lockSeats = async (req, res, next) => {
  try {
    const { tripId, seatIds } = req.body
    const userId = req.jwtDecoded.id 

    await seatLockService.lockSeats(tripId, seatIds, userId)
    
    // Notify others
    req.io.emit('seats:locked', { tripId, seatIds })

    res.status(StatusCodes.OK).json({ message: 'Seats locked successfully' })
  } catch (error) {
    next(error)
  }
}

const unlockSeats = async (req, res, next) => {
  try {
    const { tripId, seatIds } = req.body
    const userId = req.jwtDecoded.id

    await seatLockService.unlockSeats(tripId, seatIds, userId)
    
    // Notify others
    req.io.emit('seats:unlocked', { tripId, seatIds })

    res.status(StatusCodes.OK).json({ message: 'Seats unlocked successfully' })
  } catch (error) {
    next(error)
  }
}

const getLockedSeats = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const lockedSeats = await seatLockService.getLockedSeats(tripId)
    res.status(StatusCodes.OK).json(lockedSeats)
  } catch (error) {
    next(error)
  }
}

export const seatController = {
  lockSeats,
  unlockSeats,
  getLockedSeats
}
