import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createPaymentLink = async (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    description: Joi.string().max(25).optional(), // PayOS max 25 characters
    items: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          quantity: Joi.number().integer().positive().required(),
          price: Joi.number().positive().required(),
        })
      )
      .optional(),
    bookingId: Joi.string().uuid().optional(),
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getPaymentLinkInformation = async (req, res, next) => {
  const schema = Joi.object({
    orderCode: Joi.string().required(),
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const paymentValidation = {
  createPaymentLink,
  getPaymentLinkInformation,
}
