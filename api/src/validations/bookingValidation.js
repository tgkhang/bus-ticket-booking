import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createBooking = async (req, res, next) => {
  const schema = Joi.object({
    tripId: Joi.string().uuid().required(),
    seatIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    passengers: Joi.array()
      .items(
        Joi.object({
          fullName: Joi.string().required(),
          documentId: Joi.string().required(),
          seatCode: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
    totalAmount: Joi.number().positive().required(),
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getBookingById = async (req, res, next) => {
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

const lockSeats = async (req, res, next) => {
  const schema = Joi.object({
    tripId: Joi.string().uuid().required(),
    seatIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    lockDuration: Joi.number().integer().min(1).max(15).optional().default(10),
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const confirmBooking = async (req, res, next) => {
  const paramSchema = Joi.object({
    id: Joi.string().uuid().required(),
  })

  const bodySchema = Joi.object({
    provider: Joi.string().valid('card', 'paypal', 'vnpay', 'momo', 'payos').optional().default('card'),
    transactionRef: Joi.string().optional(),
  })

  try {
    await paramSchema.validateAsync(req.params, { abortEarly: false })
    await bodySchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const bookingValidation = {
  createBooking,
  getBookingById,
  lockSeats,
  confirmBooking,
}
