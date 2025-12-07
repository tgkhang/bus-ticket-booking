import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// ============================================
// BUS VALIDATIONS
// ============================================

const createNewBus = async (req, _res, next) => {
  const schema = Joi.object({
    operatorId: Joi.string().uuid().required(),
    plateNumber: Joi.string()
      .min(5)
      .max(20)
      .required()
      .trim()
      .pattern(/^[A-Z0-9-]+$/)
      .messages({
        'string.pattern.base': 'Plate number must contain only uppercase letters, numbers, and hyphens',
      }),
    model: Joi.string().min(2).max(100).required().trim(),
    seatCapacity: Joi.number().integer().min(1).max(100).required(),
    amenities: Joi.object({
      wifi: Joi.boolean().default(false),
      ac: Joi.boolean().default(false),
      restroom: Joi.boolean().default(false),
      entertainment: Joi.boolean().default(false),
      usb_charging: Joi.boolean().default(false),
      reclining_seats: Joi.boolean().default(false),
      reading_light: Joi.boolean().default(false),
      blanket: Joi.boolean().default(false),
      water: Joi.boolean().default(false),
    }).default({}),
  })

  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateBus = async (req, _res, next) => {
  const schema = Joi.object({
    plateNumber: Joi.string()
      .min(5)
      .max(20)
      .trim()
      .pattern(/^[A-Z0-9-]+$/)
      .messages({
        'string.pattern.base': 'Plate number must contain only uppercase letters, numbers, and hyphens',
      }),
    model: Joi.string().min(2).max(100).trim(),
    seatCapacity: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid('active', 'inactive', 'maintenance'),
    amenities: Joi.object({
      wifi: Joi.boolean(),
      ac: Joi.boolean(),
      restroom: Joi.boolean(),
      entertainment: Joi.boolean(),
      usb_charging: Joi.boolean(),
      reclining_seats: Joi.boolean(),
      reading_light: Joi.boolean(),
      blanket: Joi.boolean(),
      water: Joi.boolean(),
    }),
  }).min(1) // At least one field must be provided for update

  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

// ============================================
// SEAT VALIDATIONS
// ============================================

const seatItemSchema = Joi.object({
  seatNumber: Joi.string()
    .min(1)
    .max(10)
    .required()
    .trim()
    .pattern(/^[A-Z0-9]+$/)
    .messages({
      'string.pattern.base': 'Seat number must contain only uppercase letters and numbers (e.g., A1, VIP1)',
    }),
  seatType: Joi.string().valid('regular', 'premium', 'sleeper').default('regular'),
  isActive: Joi.boolean().default(true),
})

const createSeats = async (req, _res, next) => {
  // console.log('Validating createSeats with body:', req.body)
  const schema = Joi.object({
    seats: Joi.array().items(seatItemSchema).min(1).required(),
  }).custom((value, helpers) => {
    // Check for duplicate seat numbers
    const seatNumbers = value.seats.map((s) => s.seatNumber.toUpperCase())
    if (new Set(seatNumbers).size !== seatNumbers.length) {
      return helpers.error('any.invalid', { message: 'Duplicate seat numbers found' })
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

const generateSeats = async (req, _res, next) => {
  const schema = Joi.object({
    layout: Joi.string()
      .valid(
        '2-2',
        '2-1',
        '1-1',
        '2-3',
        '1-2',
        'Sleeper-32',
        'Sleeper-40',
        'Cabin-VIP',
        'Limo-9',
        'Limo-16',
        // 'City-Transit',
        // 'Mini-Bus'
      )
      .required()
      .messages({
        'any.only': 'Layout must be a valid bus type code (e.g., 2-2, Sleeper-32, Limo-9, etc.)',
      }),
    rows: Joi.number().integer().min(1).max(30).required(),
    seatType: Joi.string().valid('regular', 'premium', 'sleeper').default('regular'),
    startRow: Joi.number().integer().min(1).default(1),
  })

  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateSeat = async (req, _res, next) => {
  const schema = Joi.object({
    seatNumber: Joi.string()
      .min(1)
      .max(10)
      .trim()
      .pattern(/^[A-Z0-9]+$/)
      .messages({
        'string.pattern.base': 'Seat number must contain only uppercase letters and numbers',
      }),
    seatType: Joi.string().valid('regular', 'premium', 'sleeper'),
    isActive: Joi.boolean(),
  }).min(1) // At least one field must be provided

  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const busValidation = {
  createNewBus,
  updateBus,
  createSeats,
  generateSeats,
  updateSeat,
}
