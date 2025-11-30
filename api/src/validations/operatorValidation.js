import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// ============================================
// OPERATOR VALIDATIONS
// ============================================

const createNewOperator = async (req, _res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(200).required().trim(),
    contactEmail: Joi.string().email().required().trim().lowercase(),
    contactPhone: Joi.string().min(8).max(20).trim().allow('', null),
    status: Joi.string().valid('pending', 'approved', 'suspended').default('pending'),
  })

  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateOperator = async (req, _res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(200).trim(),
    contactEmail: Joi.string().email().trim().lowercase(),
    contactPhone: Joi.string().min(8).max(20).trim().allow('', null),
    status: Joi.string().valid('pending', 'approved', 'suspended'),
  }).min(1) // At least one field must be provided for update

  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const operatorValidation = {
  createNewOperator,
  updateOperator,
}
