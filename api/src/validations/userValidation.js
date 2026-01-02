import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE, USER_ROLES } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().trim(),
    email: Joi.string().email().required().trim().message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false, // show all errors at once
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const verifyAccount = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().email().required().trim().message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required(),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().email().required().trim().message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    displayName: Joi.string().trim().strict(),
    phoneNumber: Joi.string().trim(),
    address: Joi.string().trim(),
    bankAccount: Joi.string().trim(),
    currentPassword: Joi.string()
      .pattern(PASSWORD_RULE)
      .message('current_password: ' + PASSWORD_RULE_MESSAGE),
    newPassword: Joi.string()
      .pattern(PASSWORD_RULE)
      .message('new_password: ' + PASSWORD_RULE_MESSAGE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const forgotPassword = async (req, _res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().email().required().trim().message(EMAIL_RULE_MESSAGE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const resetPassword = async (req, _res, next) => {
  const correctCondition = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const createByAdmin = async (req, _res, next) => {
  const correctCondition = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().trim(),
    email: Joi.string().email().required().trim().message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    displayName: Joi.string().trim().optional(),
    role: Joi.string()
      .valid(...Object.values(USER_ROLES))
      .optional(),
    isActive: Joi.boolean().optional(),
    operatorId: Joi.string().trim().optional(),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateByAdmin = async (req, _res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().trim().optional(),
    displayName: Joi.string().trim().optional(),
    username: Joi.string().alphanum().min(3).max(30).trim().optional(),
    email: Joi.string().email().message(EMAIL_RULE_MESSAGE).trim().optional(),
    password: Joi.string().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE).optional(),
    role: Joi.string().valid(...Object.values(USER_ROLES)).optional(),
    active: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    operatorId: Joi.string().trim().optional(),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update,
  forgotPassword,
  resetPassword,
  createByAdmin,
  updateByAdmin,
}
