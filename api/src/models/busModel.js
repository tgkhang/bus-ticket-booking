import { GET_DB } from '~/config/prisma'

const includeRelations = {
  operator: true,
  seats: {
    orderBy: { seat_number: 'asc' }
  },
}

// ============================================
// BUS CRUD OPERATIONS
// ============================================

const createBus = async (data) => {
  try {
    const prisma = GET_DB()

    // Convert amenities object to JSON string
    const amenitiesJson = data.amenities ? JSON.stringify(data.amenities) : null

    return await prisma.bus.create({
      data: {
        operator_id: data.operator_id,
        plate_number: data.plate_number.toUpperCase(),
        model: data.model,
        seat_capacity: data.seat_capacity,
        amenities_json: amenitiesJson,
      },
      include: includeRelations,
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findBusById = async (id) => {
  try {
    const prisma = GET_DB()
    const bus = await prisma.bus.findUnique({
      where: { id },
      include: includeRelations,
    })

    // Parse amenities JSON
    if (bus && bus.amenities_json) {
      bus.amenities = JSON.parse(bus.amenities_json)
    }

    return bus
  } catch (error) {
    throw new Error(error)
  }
}

const findBusByPlateNumber = async (plateNumber) => {
  try {
    const prisma = GET_DB()
    return await prisma.bus.findUnique({
      where: { plate_number: plateNumber.toUpperCase() },
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findAllBuses = async (filters = {}, pagination = {}) => {
  try {
    const prisma = GET_DB()
    const { operatorId, plateNumber, minCapacity, search } = filters
    const { page = 1, limit = 20 } = pagination

    const skip = (page - 1) * limit
    const take = parseInt(limit)

    // Build where clause
    const where = {}

    if (operatorId) {
      where.operator_id = operatorId
    }

    if (plateNumber) {
      where.plate_number = {
        contains: plateNumber.toUpperCase(),
        mode: 'insensitive'
      }
    }

    if (minCapacity) {
      where.seat_capacity = {
        gte: parseInt(minCapacity)
      }
    }

    if (search) {
      where.OR = [
        { plate_number: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await prisma.bus.count({ where })

    // Get buses
    const buses = await prisma.bus.findMany({
      where,
      skip,
      take,
      include: includeRelations,
      orderBy: { plate_number: 'asc' },
    })

    // Parse amenities JSON for each bus
    buses.forEach(bus => {
      if (bus.amenities_json) {
        bus.amenities = JSON.parse(bus.amenities_json)
      }
    })

    return {
      data: buses,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateBus = async (id, data) => {
  try {
    const prisma = GET_DB()

    const updateData = {}

    if (data.plate_number) updateData.plate_number = data.plate_number.toUpperCase()
    if (data.model) updateData.model = data.model
    if (data.seat_capacity) updateData.seat_capacity = data.seat_capacity
    if (data.status) updateData.status = data.status
    if (data.amenities) updateData.amenities_json = JSON.stringify(data.amenities)

    const updated = await prisma.bus.update({
      where: { id },
      data: updateData,
      include: includeRelations,
    })

    // Parse amenities JSON
    if (updated && updated.amenities_json) {
      updated.amenities = JSON.parse(updated.amenities_json)
    }

    return updated
  } catch (error) {
    throw new Error(error)
  }
}

const deleteBus = async (id) => {
  try {
    const prisma = GET_DB()
    return await prisma.bus.delete({
      where: { id },
    })
  } catch (error) {
    throw new Error(error)
  }
}

// ============================================
// BUS-SPECIFIC QUERIES
// ============================================

const checkBusHasActiveTrips = async (busId) => {
  try {
    const prisma = GET_DB()
    const count = await prisma.trip.count({
      where: {
        bus_id: busId,
        status: { in: ['scheduled', 'active'] },
      },
    })
    return count > 0
  } catch (error) {
    throw new Error(error)
  }
}

const getBusWithTrips = async (busId, filters = {}) => {
  try {
    const prisma = GET_DB()
    const { status, startDate, endDate } = filters

    const tripWhere = {}
    if (status) tripWhere.status = status
    if (startDate || endDate) {
      tripWhere.departure_time = {}
      if (startDate) tripWhere.departure_time.gte = new Date(startDate)
      if (endDate) tripWhere.departure_time.lte = new Date(endDate)
    }

    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        operator: true,
        seats: { orderBy: { seat_number: 'asc' } },
        trips: {
          where: tripWhere,
          include: {
            route: {
              include: {
                originStop: true,
                destinationStop: true,
              },
            },
          },
          orderBy: { departure_time: 'asc' },
        },
      },
    })

    // Parse amenities JSON
    if (bus && bus.amenities_json) {
      bus.amenities = JSON.parse(bus.amenities_json)
    }

    return bus
  } catch (error) {
    throw new Error(error)
  }
}

const searchBuses = async (filters = {}) => {
  try {
    const prisma = GET_DB()
    const { originStopId, destinationStopId, date, seatType, minSeats, amenities } = filters

    // Build complex query to find buses with available trips
    const where = {}

    // If searching by route
    if (originStopId || destinationStopId || date) {
      where.trips = {
        some: {
          status: { in: ['scheduled', 'active'] },
        },
      }

      if (originStopId || destinationStopId) {
        where.trips.some.route = {}
        if (originStopId) where.trips.some.route.originStopId = originStopId
        if (destinationStopId) where.trips.some.route.destinationStopId = destinationStopId
      }

      if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        where.trips.some.departure_time = {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    }

    // Filter by minimum seats
    if (minSeats) {
      where.seat_capacity = { gte: parseInt(minSeats) }
    }

    // Filter by seat type (has seats of this type)
    if (seatType) {
      where.seats = {
        some: {
          seat_type: seatType,
          is_active: true,
        },
      }
    }

    const buses = await prisma.bus.findMany({
      where,
      include: {
        operator: true,
        seats: { where: { is_active: true } },
        trips: {
          where: {
            status: { in: ['scheduled', 'active'] },
          },
          include: {
            route: {
              include: {
                originStop: true,
                destinationStop: true,
              },
            },
          },
          take: 5, // Limit to next 5 trips
          orderBy: { departure_time: 'asc' },
        },
      },
    })

    // Parse amenities and filter by amenities if requested
    let filteredBuses = buses.map(bus => {
      if (bus.amenities_json) {
        bus.amenities = JSON.parse(bus.amenities_json)
      }
      return bus
    })

    // Filter by amenities (e.g., wifi=true, ac=true)
    if (amenities) {
      const requiredAmenities = amenities.split(',').map(a => a.trim())
      filteredBuses = filteredBuses.filter(bus => {
        if (!bus.amenities) return false
        return requiredAmenities.every(amenity => bus.amenities[amenity] === true)
      })
    }

    return filteredBuses
  } catch (error) {
    throw new Error(error)
  }
}

export const busModel = {
  createBus,
  findBusById,
  findBusByPlateNumber,
  findAllBuses,
  updateBus,
  deleteBus,
  checkBusHasActiveTrips,
  getBusWithTrips,
  searchBuses,
}
