import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Common coordinate validation
const coordinateSchema = {
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
}

// Stop validations
const createStop = async (req, _res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(120).required().trim(),
    address: Joi.string().allow('', null),
    ...coordinateSchema,
    active: Joi.boolean().default(true),
  })
  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateStop = async (req, _res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(120).trim(),
    address: Joi.string().allow('', null),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    active: Joi.boolean(),
  })
  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

// RouteStops item validation
const routeStopItemSchema = Joi.object({
  stopId: Joi.string().uuid().required(),
  sequence: Joi.number().integer().min(1).required(),
  isPickup: Joi.boolean().default(true),
  isDropoff: Joi.boolean().default(true),
  note: Joi.string().allow('', null),
})

const createRoute = async (req, _res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(160).required().trim(),
    operatorId: Joi.string().uuid().required(),
    originStopId: Joi.string().uuid().required(),
    destinationStopId: Joi.string().uuid().required(),
    distanceKm: Joi.number().min(0),
    estimatedMinutes: Joi.number().integer().min(0),
    active: Joi.boolean().default(true),
    stops: Joi.array().items(routeStopItemSchema).default([]),
  }).custom((value, helpers) => {
    if (value.originStopId === value.destinationStopId) {
      return helpers.error('any.invalid', { message: 'Origin and destination must be different' })
    }
    const sequences = value.stops.map((s) => s.sequence)
    if (new Set(sequences).size !== sequences.length) {
      return helpers.error('any.invalid', { message: 'Duplicate sequence numbers in stops' })
    }
    const stopIds = value.stops.map((s) => s.stopId)
    if (new Set(stopIds).size !== stopIds.length) {
      return helpers.error('any.invalid', { message: 'Duplicate stopIds in stops list' })
    }
    return value
  })
  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateRoute = async (req, _res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(160).trim(),
    operatorId: Joi.string().uuid(),
    originStopId: Joi.string().uuid(),
    destinationStopId: Joi.string().uuid(),
    distanceKm: Joi.number().min(0),
    estimatedMinutes: Joi.number().integer().min(0),
    active: Joi.boolean(),
    stops: Joi.array().items(routeStopItemSchema), // optional replace whole sequence
  }).custom((value, helpers) => {
    if (value.originStopId && value.destinationStopId && value.originStopId === value.destinationStopId) {
      return helpers.error('any.invalid', { message: 'Origin and destination must be different' })
    }
    if (value.stops) {
      const sequences = value.stops.map((s) => s.sequence)
      if (new Set(sequences).size !== sequences.length) {
        return helpers.error('any.invalid', { message: 'Duplicate sequence numbers in stops' })
      }
      const stopIds = value.stops.map((s) => s.stopId)
      if (new Set(stopIds).size !== stopIds.length) {
        return helpers.error('any.invalid', { message: 'Duplicate stopIds in stops list' })
      }
    }
    return value
  })
  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const routeValidation = {
  createStop,
  updateStop,
  createRoute,
  updateRoute,
}
