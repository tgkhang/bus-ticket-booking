import { StatusCodes } from 'http-status-codes'
import { tripService } from '~/services/tripService'

const search = async (req, res, next) => {
  try {
    const filters = res.locals.filters || req.query || {}
    const result = await tripService.searchTrips(filters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params
    const trip = await tripService.getTripById(id)
    res.status(StatusCodes.OK).json(trip)
  } catch (error) {
    next(error)
  }
}

export const tripController = { search, getTripById }
