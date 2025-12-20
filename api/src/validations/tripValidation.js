import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Validate query params for trip search
const search = async (req, res, next) => {
  const schema = Joi.object({
    originStopId: Joi.string().uuid(),
    destinationStopId: Joi.string().uuid(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    timeFrom: Joi.string().pattern(/^\d{2}:\d{2}$/), // HH:mm
    timeTo: Joi.string().pattern(/^\d{2}:\d{2}$/),
    startTime: Joi.string().pattern(/^\d{2}:\d{2}$/),
    endTime: Joi.string().pattern(/^\d{2}:\d{2}$/),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    busModel: Joi.string(),
    busType: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string()).min(1)
    ),
    amenities: Joi.string(), // comma-separated
    status: Joi.string().valid('scheduled', 'active', 'completed', 'cancelled'),
    passengers: Joi.number().integer().min(1).default(1),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('price', 'departure', 'duration').default('departure'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }).custom((value, helpers) => {
    if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
      return helpers.error('any.invalid', { message: 'minPrice must be <= maxPrice' })
    }
    // Alias startTime/endTime -> timeFrom/timeTo
    if (value.startTime && !value.timeFrom) value.timeFrom = value.startTime
    if (value.endTime && !value.timeTo) value.timeTo = value.endTime
    // Ensure timeFrom <= timeTo when both provided
    if (value.timeFrom && value.timeTo) {
      const [fh, fm] = value.timeFrom.split(':').map(Number)
      const [th, tm] = value.timeTo.split(':').map(Number)
      const fromMin = fh * 60 + fm
      const toMin = th * 60 + tm
      if (fromMin > toMin) {
        return helpers.error('any.invalid', { message: 'timeFrom must be <= timeTo' })
      }
    }
    return value
  })

  try {
    const value = await schema.validateAsync(req.query, { abortEarly: false, stripUnknown: true })
    res.locals.filters = value
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}


const createTrip = async (req, res, next) => {
  const schema = Joi.object({
    routeId: Joi.string().uuid().required(),
    busId: Joi.string().uuid().required(),
    departureTime: Joi.date().iso().required(),
    arrivalTime: Joi.date().iso().greater(Joi.ref('departureTime')).required(),
    basePrice: Joi.number().min(0).required(),
    status: Joi.string().valid('scheduled', 'active', 'completed', 'cancelled').default('scheduled'),
  })

  try {
    const value = await schema.validateAsync(req.body, { abortEarly: false })
    req.body = value
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateTrip = async (req, res, next) => {
  const paramsSchema = Joi.object({
    id: Joi.string().uuid().required(),
  })

  const bodySchema = Joi.object({
    routeId: Joi.string().uuid(),
    busId: Joi.string().uuid(),
    departureTime: Joi.date().iso(),
    arrivalTime: Joi.date().iso(),
    basePrice: Joi.number().min(0),
    status: Joi.string().valid('scheduled', 'active', 'completed', 'cancelled'),
  }).custom((value, helpers) => {
    // If both departure and arrival are provided, ensure arrival > departure
    if (value.departureTime && value.arrivalTime) {
      if (new Date(value.arrivalTime) <= new Date(value.departureTime)) {
        return helpers.error('any.invalid', { message: 'arrivalTime must be after departureTime' })
      }
    }
    return value
  })

  try {
    await paramsSchema.validateAsync(req.params)
    const value = await bodySchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    req.body = value
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const tripValidation = { search, createTrip, updateTrip }
