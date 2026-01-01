import { StatusCodes } from 'http-status-codes'
import { busService } from '~/services/busService'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

// ============================================
// BUS CRUD CONTROLLERS
// ============================================

const createBus = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null

    const result = await busService.createBus(req.body, userRole, userOperatorId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const listBuses = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null

    // Extract query params for filtering
    const filters = {
      operatorId: req.query.operatorId,
      plateNumber: req.query.plateNumber,
      minCapacity: req.query.minCapacity,
      search: req.query.search,
    }

    // Extract pagination params
    let { page, limit } = req.query
    if (!page) page = DEFAULT_PAGE
    if (!limit) limit = DEFAULT_ITEMS_PER_PAGE

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    }

    const result = await busService.listBuses(filters, pagination, userRole, userOperatorId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBus = async (req, res, next) => {
  try {
    const result = await busService.getBus(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateBus = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null

    const result = await busService.updateBus(req.params.id, req.body, userRole, userOperatorId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteBus = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null

    const result = await busService.deleteBus(req.params.id, userRole, userOperatorId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

// ============================================
// SEAT MANAGEMENT CONTROLLERS
// ============================================

const createSeats = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null
    const busId = req.params.busId

    const result = await busService.createSeats(busId, req.body, userRole, userOperatorId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const generateSeats = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null
    const busId = req.params.busId

    const result = await busService.generateSeats(busId, req.body, userRole, userOperatorId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const listSeats = async (req, res, next) => {
  try {
    const busId = req.params.busId
    const includeInactive = req.query.includeInactive === 'true'

    const result = await busService.listSeats(busId, includeInactive)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateSeat = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null
    const { busId, seatId } = req.params

    const result = await busService.updateSeat(busId, seatId, req.body, userRole, userOperatorId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteSeat = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role
    const userOperatorId = req.jwtDecoded.operatorId || null
    const { busId, seatId } = req.params

    const result = await busService.deleteSeat(busId, seatId, userRole, userOperatorId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteAllSeats = async (req, res, next) => {
  const userRole = req.jwtDecoded.role
  //const userOperatorId = req.jwtDecoded.operatorId || null
  const busId = req.params.busId
  const result = await busService.deleteAllSeats(busId, userRole)
  res.status(StatusCodes.OK).json(result)
}

// ============================================
// ADDITIONAL CONTROLLERS
// ============================================

const searchBuses = async (req, res, next) => {
  try {
    const filters = {
      originStopId: req.query.originStopId,
      destinationStopId: req.query.destinationStopId,
      date: req.query.date,
      seatType: req.query.seatType,
      minSeats: req.query.minSeats,
      amenities: req.query.amenities, // e.g., "wifi,ac"
    }

    const result = await busService.searchBuses(filters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getSeatLayout = async (req, res, next) => {
  try {
    const busId = req.params.busId
    const tripId = req.query.tripId || null

    const result = await busService.getSeatLayout(busId, tripId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBusTrips = async (req, res, next) => {
  try {
    const busId = req.params.busId
    const filters = {
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    }

    const result = await busService.getBusTrips(busId, filters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const checkAvailability = async (req, res, next) => {
  try {
    const busId = req.params.busId
    const { startDate, endDate } = req.query

    const result = await busService.checkAvailability(busId, startDate, endDate)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const uploadBusImages = async (req, res, next) => {
  const busId = req.params.id
  const files = req.files // Array of uploaded files from multer

  if (!files || files.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'No images provided',
    })
  }

  const result = await busService.uploadBusImages(busId, files)
  res.status(StatusCodes.OK).json(result)
}

const updateBusImages = async (req, res, next) => {
  const busId = req.params.id
  const files = req.files // Array of uploaded files from multer

  if (!files || files.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'No images provided',
    })
  }

  const result = await busService.updateBusImages(busId, files)
  res.status(StatusCodes.OK).json(result)
}

const deleteBusImage = async (req, res, next) => {
  const busId = req.params.id
  const imageIndex = parseInt(req.params.imageIndex, 10)

  if (isNaN(imageIndex) || imageIndex < 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Invalid image index',
    })
  }

  const result = await busService.deleteBusImage(busId, imageIndex)
  res.status(StatusCodes.OK).json(result)
}

const deleteAllBusImages = async (req, res, next) => {
  const busId = req.params.id
  const result = await busService.deleteAllBusImages(busId)
  res.status(StatusCodes.OK).json(result)
}

export const busController = {
  // Bus CRUD
  createBus,
  listBuses,
  getBus,
  updateBus,
  deleteBus,

  // Seat management
  createSeats,
  generateSeats,
  listSeats,
  updateSeat,
  deleteSeat,
  deleteAllSeats,

  // Additional
  searchBuses,
  getSeatLayout,
  getBusTrips,
  checkAvailability,

  // Upload bus images
  uploadBusImages,
  updateBusImages,
  deleteBusImage,
  deleteAllBusImages,
}
