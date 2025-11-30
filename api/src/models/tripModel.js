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
    // date boundary; timeFrom/timeTo refine
    const dayStart = new Date(`${filters.date}T00:00:00.000Z`)
    const dayEnd = new Date(`${filters.date}T23:59:59.999Z`)
    where.departure_time = { gte: dayStart, lte: dayEnd }
    if (filters.timeFrom) {
      const [h, m] = filters.timeFrom.split(':')
      const from = new Date(dayStart)
      from.setUTCHours(Number(h), Number(m), 0, 0)
      if (from > where.departure_time.gte) where.departure_time.gte = from
    }
    if (filters.timeTo) {
      const [h, m] = filters.timeTo.split(':')
      const to = new Date(dayStart)
      to.setUTCHours(Number(h), Number(m), 59, 999)
      if (to < where.departure_time.lte) where.departure_time.lte = to
    }
  }
  if (filters.minPrice || filters.maxPrice) {
    where.base_price = {}
    if (filters.minPrice) where.base_price.gte = filters.minPrice
    if (filters.maxPrice) where.base_price.lte = filters.maxPrice
  }
  if (filters.status) {
    where.status = filters.status
  }
  if (filters.busModel || filters.amenities?.length) {
    where.bus = {}
    if (filters.busModel) where.bus.model = { contains: filters.busModel, mode: 'insensitive' }
    if (filters.amenities?.length) {
      // Match each amenity key set to true in the serialized JSON
      const amenityClauses = filters.amenities.map((a) => ({ amenities_json: { contains: `"${a}":true` } }))
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

  // Sorting
  let orderBy
  if (filters.sortBy === 'price') {
    orderBy = { base_price: filters.sortOrder }
  } else if (filters.sortBy === 'departure') {
    orderBy = { departure_time: filters.sortOrder }
  } else {
    // duration sort later in memory
    orderBy = { departure_time: 'asc' }
  }

  const [total, rows] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        route: { include: { originStop: true, destinationStop: true } },
        bus: true,
      },
    }),
  ])

  let data = rows.map((t) => ({
    ...t,
    durationMinutes: Math.round((t.arrival_time.getTime() - t.departure_time.getTime()) / 60000),
  }))

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

export const tripModel = { searchTrips }
