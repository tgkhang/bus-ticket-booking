import { GET_DB } from '~/config/prisma'
import { busModel } from './busModel'

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
  if (Array.isArray(filters.statusIn) && filters.statusIn.length) {
    where.status = { in: filters.statusIn }
  } else if (filters.status) {
    where.status = filters.status
  }
  if (filters.busModel || filters.amenities?.length || filters.busType?.length) {
    where.bus = {}
    if (filters.busModel) where.bus.model = { contains: filters.busModel, mode: 'insensitive' }
    if (filters.busType?.length) where.bus.busType = { in: filters.busType }
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
        busType: t.bus.busType,
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
        include: {
          operator: true,
          seats: true,
        },
      },
      staff: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              phoneNumber: true,
              avatar: true,
            },
          },
        },
      },
      seatStatuses: {
        include: {
          seat: true,
        },
      },
      bookings: {
        include: {
          user: true,
          passengerDetails: true,
        },
      },
    },
  })

  if (trip) {
    trip.durationMinutes = Math.round((trip.arrivalTime.getTime() - trip.departureTime.getTime()) / 60000)

    // Parse bus amenities
    if (trip.bus?.amenities) {
      try {
        trip.bus.amenities = JSON.parse(trip.bus.amenities)
      } catch (e) {
        trip.bus.amenities = {}
      }
    }

    // Parse bus images
    if (trip.bus?.images) {
      try {
        trip.bus.images = JSON.parse(trip.bus.images)
      } catch (e) {
        trip.bus.images = []
      }
    }

    // Transform seatStatuses into a seats array with combined data for the admin view
    if (trip.seatStatuses && trip.seatStatuses.length > 0) {
      trip.seats = trip.seatStatuses.map((ss) => {
        // Find passenger for this seat if it's booked
        let passengerName = null
        if (ss.status === 'booked' && trip.bookings) {
          // Look for a passenger detail with matching seatCode
          for (const booking of trip.bookings) {
            if (booking.passengerDetails) {
              const passenger = booking.passengerDetails.find((pd) => pd.seatCode === ss.seat.seatNumber)
              if (passenger) {
                passengerName = passenger.fullName
                break
              }
            }
          }
        }

        return {
          id: ss.seat.id,
          seatNumber: ss.seat.seatNumber,
          seatType: ss.seat.seatType,
          status: ss.status,
          passengerName: passengerName,
        }
      })
    }
  }
  return trip
}

const createTrip = async (tripData) => {
  const prisma = GET_DB()

  const bus = await busModel.findBusById(tripData.busId)

  if (!bus) {
    throw new Error('Bus not found')
  }

  // Create trip and initialize seat statuses
  const trip = await prisma.trip.create({
    data: {
      routeId: tripData.routeId,
      busId: tripData.busId,
      operatorId: bus.operatorId,
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

  const sortBy = String(filters.sortBy || 'departureTime')
  const sortOrderRaw = String(filters.sortOrder || 'desc').toLowerCase()
  const sortOrder = sortOrderRaw === 'asc' ? 'asc' : 'desc'

  // Build where clause using helper
  const where = buildListWhere(filters)

  // Get total count for pagination
  const total = await prisma.trip.count({ where })

  let trips = []

  if (sortBy === 'booking') {
    // Sort by number of booked seats (derived from seatStatuses) across ALL matching trips,
    // then apply pagination on the ordered trip IDs.
    const all = await prisma.trip.findMany({
      where,
      select: {
        id: true,
        departureTime: true,
      },
    })

    const ids = all.map((t) => t.id)

    const bookedCounts = ids.length
      ? await prisma.seatStatus.groupBy({
          by: ['tripId'],
          where: {
            tripId: { in: ids },
            status: 'booked',
          },
          _count: { _all: true },
        })
      : []

    const bookedCountByTripId = new Map(bookedCounts.map((r) => [r.tripId, r._count._all]))
    const departureByTripId = new Map(all.map((t) => [t.id, t.departureTime.getTime()]))

    ids.sort((a, b) => {
      const aCount = bookedCountByTripId.get(a) || 0
      const bCount = bookedCountByTripId.get(b) || 0
      if (aCount !== bCount) return aCount - bCount
      // Tie-breaker: departure time
      return (departureByTripId.get(a) || 0) - (departureByTripId.get(b) || 0)
    })

    if (sortOrder === 'desc') ids.reverse()

    const pageIds = ids.slice(skip, skip + limit)
    if (pageIds.length) {
      const fetched = await prisma.trip.findMany({
        where: { id: { in: pageIds } },
        include: getTripInclude(true),
      })
      const byId = new Map(fetched.map((t) => [t.id, t]))
      trips = pageIds.map((id) => byId.get(id)).filter(Boolean)
    }
  } else {
    const sortField = sortBy === 'arrivalTime' ? 'arrivalTime' : 'departureTime'

    trips = await prisma.trip.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortField]: sortOrder }, { id: 'desc' }],
      include: getTripInclude(true),
    })
  }

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
  if (updateData.busId !== undefined) {
    data.busId = updateData.busId

    const bus = busModel.findBusById(updateData.busId)
    if (!bus) {
      throw new Error('Bus not found')
    }

    data.operatorId = bus.operatorId
  }
  if (updateData.departureTime !== undefined) data.departureTime = new Date(updateData.departureTime)
  if (updateData.arrivalTime !== undefined) data.arrivalTime = new Date(updateData.arrivalTime)
  if (updateData.basePrice !== undefined) data.basePrice = updateData.basePrice
  if (updateData.status !== undefined) data.status = updateData.status
  if (updateData.staffId !== undefined) data.staffId = updateData.staffId

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
    staffId: trip.staffId,
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
  if (filters.staffId) {
    where.staffId = filters.staffId
    where.NOT = { staffId: null }
  }

  // Date range filter for departure time
  if (filters.dateFrom || filters.dateTo) {
    where.departureTime = {}
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      where.departureTime.gte = fromDate
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      where.departureTime.lte = toDate
    }
  } else {
    // Single departure time filter (exact match)
    if (filters.departureTime) {
      where.departureTime = new Date(filters.departureTime)
    }
  }

  if (filters.arrivalTime) {
    where.arrivalTime = new Date(filters.arrivalTime)
  }

  if (filters.basePrice) {
    where.basePrice = Number(filters.basePrice)
  }

  // Filter by operator ID (trips where bus belongs to this operator)
  if (filters.operatorId) {
    where.bus = { ...(where.bus || {}), operatorId: filters.operatorId }
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

// Search trips by city names for chatbot
const searchTripsByCityNames = async (originCity, destinationCity, date = null, filters = {}) => {
  const prisma = GET_DB()
  
  const where = {
    route: {
      AND: []
    },
    status: 'scheduled'
  }

  // Match origin city (case-insensitive, partial match)
  if (originCity) {
    where.route.AND.push({
      originStop: {
        OR: [
          { name: { contains: originCity, mode: 'insensitive' } },
          { address: { contains: originCity, mode: 'insensitive' } }
        ]
      }
    })
  }

  // Match destination city (case-insensitive, partial match)
  if (destinationCity) {
    where.route.AND.push({
      destinationStop: {
        OR: [
          { name: { contains: destinationCity, mode: 'insensitive' } },
          { address: { contains: destinationCity, mode: 'insensitive' } }
        ]
      }
    })
  }

  // If no city filters, remove empty AND
  if (where.route.AND.length === 0) {
    delete where.route
  }

  // Add date filter if provided
  if (date) {
    const localDate = new Date(date)
    const dayStart = new Date(localDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(localDate)
    dayEnd.setHours(23, 59, 59, 999)
    where.departureTime = { gte: dayStart, lte: dayEnd }
  } else {
    // If no specific date, only get future trips
    where.departureTime = { gte: new Date() }
  }

  // Add price filter if provided
  if (filters.maxPrice) {
    where.basePrice = { lte: Number(filters.maxPrice) }
  }

  // Add bus type filter if provided
  if (filters.busType) {
    where.bus = { busType: filters.busType }
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { departureTime: 'asc' },
    take: filters.limit || 5,
    include: {
      route: {
        include: {
          originStop: true,
          destinationStop: true
        }
      },
      bus: {
        include: {
          operator: true
        }
      },
      seatStatuses: {
        select: {
          status: true
        }
      }
    }
  })

  // Normalize string for diacritic-insensitive matching
  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  };

  // Post-filter: Match without diacritics if needed
  let filteredTrips = trips;
  if (originCity || destinationCity) {
    const normalizedOrigin = normalizeString(originCity);
    const normalizedDest = normalizeString(destinationCity);
    
    filteredTrips = trips.filter(trip => {
      let originMatch = !originCity; // Default true if no origin filter
      let destMatch = !destinationCity; // Default true if no dest filter
      
      if (originCity) {
        const normalizedStopName = normalizeString(trip.route.originStop.name);
        const normalizedStopAddr = normalizeString(trip.route.originStop.address);
        originMatch = normalizedStopName.includes(normalizedOrigin) || 
                     normalizedStopAddr.includes(normalizedOrigin);
      }
      
      if (destinationCity) {
        const normalizedStopName = normalizeString(trip.route.destinationStop.name);
        const normalizedStopAddr = normalizeString(trip.route.destinationStop.address);
        destMatch = normalizedStopName.includes(normalizedDest) || 
                   normalizedStopAddr.includes(normalizedDest);
      }
      
      return originMatch && destMatch;
    });
  }

  // Calculate available seats for each trip
  const tripsWithSeats = filteredTrips.map(trip => {
    const availableSeats = trip.seatStatuses.filter(ss => ss.status === 'available').length
    return {
      ...trip,
      availableSeats
    }
  })

  return tripsWithSeats
}

export const tripModel = {
  searchTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  listTrips,
  searchTripsByCityNames,
}
