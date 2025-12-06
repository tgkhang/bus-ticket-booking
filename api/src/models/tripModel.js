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
    data.sort((a, b) => (filters.sortOrder === 'asc' ? a.durationMinutes - b.durationMinutes : b.durationMinutes - a.durationMinutes))
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

export const tripModel = { searchTrips, getTripById }
