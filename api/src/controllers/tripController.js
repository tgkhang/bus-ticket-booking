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

export const tripController = { search }
