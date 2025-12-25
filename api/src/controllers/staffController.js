import { StatusCodes } from 'http-status-codes'
import { staffService } from '~/services/staffService'

// Get staff's assigned trips
const getMyTrips = async (req, res, next) => {
  try {
    const staffId = req.jwtDecoded.staffId
    const { status, date } = req.query

    const trips = await staffService.getAssignedTrips(staffId, { status, date })
    res.status(StatusCodes.OK).json({
      success: true,
      data: trips,
    })
  } catch (error) {
    next(error)
  }
}

// Get passengers for a specific trip
const getTripPassengers = async (req, res, next) => {
  try {
    const staffId = req.jwtDecoded.staffId
    const { tripId } = req.params

    const passengers = await staffService.getTripPassengers(tripId, staffId)
    res.status(StatusCodes.OK).json({
      success: true,
      data: passengers,
    })
  } catch (error) {
    next(error)
  }
}

// Mark passenger as boarded
const markPassengerBoarded = async (req, res, next) => {
  try {
    const staffId = req.jwtDecoded.staffId
    const { passengerId } = req.params

    const updated = await staffService.markPassengerBoarded(passengerId, staffId)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Passenger marked as boarded',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// Update trip status (departed/arrived)
const updateTripStatus = async (req, res, next) => {
  try {
    const staffId = req.jwtDecoded.staffId
    const { tripId } = req.params
    const { status } = req.body

    const updated = await staffService.updateTripStatus(tripId, staffId, status)
    res.status(StatusCodes.OK).json({
      success: true,
      message: `Trip marked as ${status}`,
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

export const staffController = {
  getMyTrips,
  getTripPassengers,
  markPassengerBoarded,
  updateTripStatus,
}
