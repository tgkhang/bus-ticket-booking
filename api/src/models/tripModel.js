import { GET_DB } from '~/config/prisma'

// Build Prisma where clause from filters
const buildWhere = (filters) => {
  const where = {}
  if (filters.originStopId || filters.destinationStopId) {
    where.route = {}
    if (filters.originStopId) where.route.originStopId = filters.originStopId
    if (filters.destinationStopId) where.route.destinationStopId = filters.destinationStopId
  }
  if (filters.date) {
    // Parse date as local time (Vietnam timezone UTC+7)
    const localDate = new Date(filters.date)
    
    // Create day boundaries in local time
    const dayStart = new Date(localDate)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(localDate)
    dayEnd.setHours(23, 59, 59, 999)
    
    where.departureTime = { gte: dayStart, lte: dayEnd }
    
    // Apply time range filters if provided
    if (filters.timeFrom) {
      const [h, m] = filters.timeFrom.split(':')
      const from = new Date(localDate)
      from.setHours(Number(h), Number(m), 0, 0)
      if (from > where.departureTime.gte) where.departureTime.gte = from
    }
    if (filters.timeTo) {
      const [h, m] = filters.timeTo.split(':')
      const to = new Date(localDate)
      to.setHours(Number(h), Number(m), 59, 999)
      if (to < where.departureTime.lte) where.departureTime.lte = to
    }
  }
  if (filters.minPrice || filters.maxPrice) {
    where.basePrice = {}
    if (filters.minPrice) where.basePrice.gte = filters.minPrice
    if (filters.maxPrice) where.basePrice.lte = filters.maxPrice
  }
  if (filters.status) {
    where.status = filters.status
  }
  if (filters.busModel || filters.amenities?.length) {
    where.bus = {}
    if (filters.busModel) where.bus.model = { contains: filters.busModel, mode: 'insensitive' }
    if (filters.amenities?.length) {
      // Match each amenity key set to true in the serialized JSON
      const amenityClauses = filters.amenities.map((a) => ({ amenities: { contains: `"${a}":true` } }))
      // Combine with existing bus filters using AND semantics
      if (amenityClauses.length === 1) {
        where.bus = { ...where.bus, ...amenityClauses[0] }
      } else {
        where.bus = { ...where.bus, AND: amenityClauses }
      }
    }
  }
  return where
}

const searchTrips = async (filters) => {
  const prisma = GET_DB()
  const where = buildWhere(filters)
  const skip = (filters.page - 1) * filters.limit
  const take = filters.limit
  const passengers = filters.passengers || 1

  // Sorting
  let orderBy
  if (filters.sortBy === 'price') {
    orderBy = { basePrice: filters.sortOrder }
  } else if (filters.sortBy === 'departure') {
    orderBy = { departureTime: filters.sortOrder }
  } else {
    // duration sort later in memory
    orderBy = { departureTime: 'asc' }
  }

  // Fetch trips with seat status counts
  const rows = await prisma.trip.findMany({
    where,
    orderBy,
    include: {
      route: { include: { originStop: true, destinationStop: true } },
      bus: true,
      seatStatuses: {
        select: {
          status: true,
        },
      },
    },
  })

  // Filter trips that have enough available seats
  const filteredRows = rows.filter((trip) => {
    const availableSeats = trip.seatStatuses.filter((ss) => ss.status === 'available').length
    return availableSeats >= passengers
  })

  const total = filteredRows.length
  const paginatedRows = filteredRows.slice(skip, skip + take)

  let data = paginatedRows.map((t) => {
    const availableSeats = t.seatStatuses.filter((ss) => ss.status === 'available').length
    return {
      id: t.id,
      routeId: t.routeId,
      busId: t.busId,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      basePrice: t.basePrice,
      status: t.status,
      durationMinutes: Math.round((t.arrivalTime.getTime() - t.departureTime.getTime()) / 60000),
      availableSeats,
      originStop: t.route.originStop,
      destinationStop: t.route.destinationStop,
      bus: {
        model: t.bus.model,
        amenities: t.bus.amenities ? JSON.parse(t.bus.amenities) : {},
      },
    }
  })

  if (filters.sortBy === 'duration') {
    data.sort((a, b) =>
      filters.sortOrder === 'asc' ? a.durationMinutes - b.durationMinutes : b.durationMinutes - a.durationMinutes
    )
  }

  return {
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit) || 1,
    data,
  }
}

const getTripById = async (id) => {
  const prisma = GET_DB()
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      route: {
        include: {
          originStop: true,
          destinationStop: true,
          stops: {
            include: { stop: true },
            orderBy: { sequence: 'asc' },
          },
        },
      },
      bus: {
        include: { operator: true },
      },
    },
  })

  if (trip) {
    trip.durationMinutes = Math.round((trip.arrivalTime.getTime() - trip.departureTime.getTime()) / 60000)
    if (trip.bus.amenities) {
      try {
        trip.bus.amenities = JSON.parse(trip.bus.amenities)
      } catch (e) {
        trip.bus.amenities = {}
      }
    }
  }
  return trip
}

const createTrip = async (tripData) => {
  const prisma = GET_DB()

  // Create trip and initialize seat statuses
  const trip = await prisma.trip.create({
    data: {
      routeId: tripData.routeId,
      busId: tripData.busId,
      departureTime: new Date(tripData.departureTime),
      arrivalTime: new Date(tripData.arrivalTime),
      basePrice: tripData.basePrice,
      status: tripData.status || 'scheduled',
    },
    include: {
      route: {
        include: {
          originStop: true,
          destinationStop: true,
        },
      },
      bus: true,
    },
  })

  // Get all seats for the bus and create seat statuses
  const seats = await prisma.seat.findMany({
    where: { busId: tripData.busId },
  })

  if (seats.length > 0) {
    await prisma.seatStatus.createMany({
      data: seats.map((seat) => ({
        tripId: trip.id,
        seatId: seat.id,
        status: 'available',
      })),
    })
  }

  return trip
}

/**
 * List trips (admin-facing with full filtering and search)
 */
const listTrips = async (filters = {}, pagination = {}) => {
  const prisma = GET_DB()
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Build where clause using helper
  const where = buildListWhere(filters)

  // Get total count for pagination
  const total = await prisma.trip.count({ where })

  // Fetch trips with all relations (including operator for admin)
  const trips = await prisma.trip.findMany({
    where,
    skip,
    take: limit,
    orderBy: { departureTime: 'desc' },
    include: getTripInclude(true),
  })

  // Transform trips using helper (include operator info)
  const data = trips.map((trip) => {
    const transformed = transformTripData(trip, true)
    // Add timestamps for admin views
    return {
      ...transformed,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    }
  })

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    data,
  }
}

const updateTrip = async (id, updateData) => {
  const prisma = GET_DB()

  const data = {}
  if (updateData.routeId !== undefined) data.routeId = updateData.routeId
  if (updateData.busId !== undefined) data.busId = updateData.busId
  if (updateData.departureTime !== undefined) data.departureTime = new Date(updateData.departureTime)
  if (updateData.arrivalTime !== undefined) data.arrivalTime = new Date(updateData.arrivalTime)
  if (updateData.basePrice !== undefined) data.basePrice = updateData.basePrice
  if (updateData.status !== undefined) data.status = updateData.status

  const trip = await prisma.trip.update({
    where: { id },
    data,
    include: {
      route: {
        include: {
          originStop: true,
          destinationStop: true,
        },
      },
      bus: true,
    },
  })

  return trip
}

const deleteTrip = async (id) => {
  const prisma = GET_DB()

  // Delete trip (cascade will handle seat statuses and bookings)
  await prisma.trip.delete({
    where: { id },
  })

  return { deleted: true }
}

/**
 * Helper: Calculate seat statistics from seatStatuses array
 */
const calculateSeatStats = (seatStatuses) => {
  const availableSeats = seatStatuses.filter((ss) => ss.status === 'available').length
  const bookedSeats = seatStatuses.filter((ss) => ss.status === 'booked').length
  return {
    availableSeats,
    bookedSeats,
    totalSeats: seatStatuses.length,
  }
}

/**
 * Helper: Transform trip data to consistent response format
 */
const transformTripData = (trip, includeOperator = false) => {
  const { availableSeats, bookedSeats, totalSeats } = calculateSeatStats(trip.seatStatuses || [])
  const durationMinutes = Math.round((trip.arrivalTime.getTime() - trip.departureTime.getTime()) / 60000)

  const result = {
    id: trip.id,
    routeId: trip.routeId,
    routeName: trip.route?.name,
    busId: trip.busId,
    busModel: trip.bus?.model,
    busPlateNumber: trip.bus?.plateNumber,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    basePrice: trip.basePrice,
    status: trip.status,
    durationMinutes,
    availableSeats,
    seatsBooked: bookedSeats,
    totalSeats,
    originStop: trip.route?.originStop?.name,
    destinationStop: trip.route?.destinationStop?.name,
  }

  // Include operator info if requested (for admin views)
  if (includeOperator && trip.bus?.operator) {
    result.operatorName = trip.bus.operator.name
  }

  // Include bus amenities if available
  if (trip.bus?.amenities) {
    result.bus = {
      model: trip.bus.model,
      amenities: typeof trip.bus.amenities === 'string' ? JSON.parse(trip.bus.amenities) : trip.bus.amenities,
    }
  }

  return result
}

/**
 * Helper: Standard trip include clause for Prisma queries
 */
const getTripInclude = (includeOperator = false) => ({
  route: {
    include: {
      originStop: true,
      destinationStop: true,
    },
  },
  bus: includeOperator
    ? {
        include: { operator: true },
      }
    : true,
  seatStatuses: {
    select: {
      status: true,
    },
  },
})
/**
 * Build Prisma where clause for admin list filters
 */
const buildListWhere = (filters) => {
  const where = {}

  if (filters.routeId) where.routeId = filters.routeId
  if (filters.busId) where.busId = filters.busId
  if (filters.status) where.status = filters.status

  if (filters.departureTime) {
    where.departureTime = new Date(filters.departureTime)
  }

  if (filters.arrivalTime) {
    where.arrivalTime = new Date(filters.arrivalTime)
  }

  if (filters.basePrice) {
    where.basePrice = Number(filters.basePrice)
  }

  // Text search across route name, bus model, or plate number
  if (filters.search) {
    where.OR = [
      { route: { name: { contains: filters.search, mode: 'insensitive' } } },
      { bus: { model: { contains: filters.search, mode: 'insensitive' } } },
      { bus: { plateNumber: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }

  return where
}

export const tripModel = {
  searchTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  listTrips,
}
