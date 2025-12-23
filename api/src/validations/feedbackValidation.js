import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const listTripFeedbacks = async (req, res, next) => {
  const paramSchema = Joi.object({
    tripId: Joi.string().uuid().required(),
  })

  const querySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  })

  try {
    await paramSchema.validateAsync(req.params, { abortEarly: false })
    await querySchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getMyTripFeedbackContext = async (req, res, next) => {
  const schema = Joi.object({
    tripId: Joi.string().uuid().required(),
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const upsertBookingFeedback = async (req, res, next) => {
  const paramSchema = Joi.object({
    id: Joi.string().uuid().required(),
  })

  const bodySchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow('', null).max(2000).optional(),
  })

  try {
    await paramSchema.validateAsync(req.params, { abortEarly: false })
    await bodySchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getBookingFeedbackContext = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().uuid().required(),
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const feedbackValidation = {
  listTripFeedbacks,
  getMyTripFeedbackContext,
  upsertBookingFeedback,
  getBookingFeedbackContext,
}
