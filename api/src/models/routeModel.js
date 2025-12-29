import { GET_DB } from '~/config/prisma'
import { Prisma } from '@prisma/client'

const includeRelation = {
  originStop: true,
  destinationStop: true,
  stops: { include: { stop: true }, orderBy: { sequence: 'asc' } },
  operator: true,
}

const createRoute = async (data, stops = []) => {
  try {
    const prisma = GET_DB()
    return await prisma.$transaction(async (tx) => {
      const created = await tx.route.create({
        data: {
          name: data.name,
          operatorId: data.operatorId,
          originStopId: data.originStopId,
          destinationStopId: data.destinationStopId,
          distanceKm: data.distanceKm || null,
          estimatedMinutes: data.estimatedMinutes || null,
          active: data.active !== undefined ? data.active : true,
        },
      })
      if (stops.length) {
        await tx.routeStop.createMany({
          data: stops.map((s) => ({
            routeId: created.id,
            stopId: s.stopId,
            sequence: s.sequence,
            isPickup: s.isPickup ?? true,
            isDropoff: s.isDropoff ?? true,
            note: s.note || null,
          })),
        })
      }
      return await tx.route.findUnique({ where: { id: created.id }, include: includeRelation })
    })
  } catch (error) {
    throw new Error(error)
  }
}

const updateRoute = async (id, data, stops) => {
  try {
    const prisma = GET_DB()
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.route.update({
        where: { id },
        data: {
          name: data.name,
          operatorId: data.operatorId,
          originStopId: data.originStopId,
          destinationStopId: data.destinationStopId,
          distanceKm: data.distanceKm,
          estimatedMinutes: data.estimatedMinutes,
          active: data.active,
        },
      })
      if (Array.isArray(stops)) {
        await tx.routeStop.deleteMany({ where: { routeId: id } })
        if (stops.length) {
          await tx.routeStop.createMany({
            data: stops.map((s) => ({
              routeId: id,
              stopId: s.stopId,
              sequence: s.sequence,
              isPickup: s.isPickup ?? true,
              isDropoff: s.isDropoff ?? true,
              note: s.note || null,
            })),
          })
        }
      }
      return await tx.route.findUnique({ where: { id: updated.id }, include: includeRelation })
    })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteRoute = async (id) => {
  try {
    const prisma = GET_DB()
    return await prisma.$transaction(async (tx) => {
      await tx.routeStop.deleteMany({ where: { routeId: id } })
      return await tx.route.delete({ where: { id } })
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findById = async (id) => {
  try {
    const prisma = GET_DB()
    return await prisma.route.findUnique({ where: { id }, include: includeRelation })
  } catch (error) {
    throw new Error(error)
  }
}

const findMany = async (filter = {}) => {
  try {
    const prisma = GET_DB()
    return await prisma.route.findMany({ where: filter, include: includeRelation, orderBy: { name: 'asc' } })
  } catch (error) {
    throw new Error(error)
  }
}

// Find if stopsId used in any routes
const findUsedStopIds = async (id) => {
  try {
    const prisma = GET_DB()
    const usage = await prisma.route.findFirst({
        where: { OR: [{ originStopId: id }, { destinationStopId: id }, { stops: { some: { stopId: id } } }] },
    })
    return usage ? true : false
  } catch (error) {
    throw new Error(error)
  }
}

const getRoutes = async (filters = {}, pagination = {}) => {
  try {
    const prisma = GET_DB()
    const { operatorId, name, originStopId, destinationStopId, active, estimatedMinutes, search } = filters
    const { page = 1, limit = 20 } = pagination

    const skip = (page - 1) * limit
    const take = parseInt(limit)
    const where = {}

    if (operatorId) {
      where.operatorId = operatorId
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      }
    }

    if (originStopId) {
      where.originStopId = originStopId
    }

    if (destinationStopId) {
      where.destinationStopId = destinationStopId
    }

    if (active !== undefined) {
      where.active = active
    }

    if (estimatedMinutes) {
      where.estimatedMinutes = parseInt(estimatedMinutes)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originStop: { name: { contains: search, mode: 'insensitive' } } },
        { destinationStop: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Get total count
    const total = await prisma.route.count({ where })

    // Get routes
    const routes = await prisma.route.findMany({
      where,
      skip,
      take,
      include: includeRelation,
      orderBy: { name: 'asc' },
    })

    return {
      data: routes,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

async function fullTextSearchRoutes(query, limit = 10, page = 1) {
  const prisma = GET_DB()
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50))
  const safePage = Math.max(1, Number(page) || 1)
  const skip = (safePage - 1) * safeLimit

  const q = (query || '').trim()

  // Empty query -> browse active routes (paginated)
  if (!q) {
    const [total, routes] = await Promise.all([
      prisma.route.count({ where: { active: true } }),
      prisma.route.findMany({
        where: { active: true },
        include: includeRelation,
        orderBy: { name: 'asc' },
        take: safeLimit,
        skip,
      }),
    ])

    const data = (routes || []).map((r) => ({
      id: r.id,
      name: r.name,
      active: r.active,
      operatorId: r.operatorId,
      originStopId: r.originStopId,
      destinationStopId: r.destinationStopId,
      originStopName: r.originStop?.name || null,
      destinationStopName: r.destinationStop?.name || null,
    }))

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    }
  }

  const [countRows, rows] = await Promise.all([
    prisma.$queryRaw(
      Prisma.sql`
        WITH q AS (
          SELECT
            lower(unaccent(${q})) AS raw,
            websearch_to_tsquery('simple', lower(unaccent(${q}))) AS tsq
        )
        SELECT COUNT(*)::int AS total
        FROM routes r, q
        WHERE r.active = TRUE
          AND (
            to_tsvector('simple', coalesce(r.search_text, '')) @@ q.tsq
            OR coalesce(r.search_text, '') % q.raw
          );
      `
    ),
    prisma.$queryRaw(
      Prisma.sql`
        WITH q AS (
          SELECT
            lower(unaccent(${q})) AS raw,
            websearch_to_tsquery('simple', lower(unaccent(${q}))) AS tsq
        )
        SELECT
          r.id,
          r.name,
          r.active,
          r."operator_id" AS "operatorId",
          r."originStopId" AS "originStopId",
          r."destinationStopId" AS "destinationStopId",
          os.name AS "originStopName",
          ds.name AS "destinationStopName"
        FROM routes r
        JOIN stops os ON os.id = r."originStopId"
        JOIN stops ds ON ds.id = r."destinationStopId"
        , q
        WHERE r.active = TRUE
          AND (
            to_tsvector('simple', coalesce(r.search_text, '')) @@ q.tsq
            OR coalesce(r.search_text, '') % q.raw
          )
        ORDER BY
          (to_tsvector('simple', coalesce(r.search_text, '')) @@ q.tsq) DESC,
          ts_rank_cd(to_tsvector('simple', coalesce(r.search_text, '')), q.tsq) DESC,
          similarity(coalesce(r.search_text, ''), q.raw) DESC,
          r.name ASC
        LIMIT ${safeLimit}
        OFFSET ${skip};
      `
    ),
  ])

  const total = Number(countRows?.[0]?.total || 0)

  return {
    data: rows || [],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  }
}

async function getPopularRoutes(limit = 4) {
  const prisma = GET_DB()
  const safeLimit = Math.max(1, Math.min(Number(limit) || 4, 20))

  // Popularity = confirmed/completed bookings per route (distinct routes)
  const rows = await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        r.id AS "id",
        r."originStopId" AS "originStopId",
        r."destinationStopId" AS "destinationStopId",
        os.name AS "from",
        ds.name AS "to",
        COUNT(b.id)::int AS "bookings",
        COALESCE(MIN(t.base_price), 0) AS "minPrice",
        COALESCE(AVG(EXTRACT(EPOCH FROM (t.arrival_time - t.departure_time)) / 60), 0)::int AS "avgDurationMinutes"
      FROM routes r
      JOIN stops os ON os.id = r."originStopId"
      JOIN stops ds ON ds.id = r."destinationStopId"
      JOIN trips t ON t.route_id = r.id
      LEFT JOIN bookings b
        ON b.trip_id = t.id
        AND b.status IN ('confirmed', 'completed')
      WHERE r.active = TRUE
      GROUP BY r.id, r."originStopId", r."destinationStopId", os.name, ds.name
      ORDER BY COUNT(b.id) DESC, MIN(t.base_price) ASC
      LIMIT ${safeLimit}
    `
  )

  // Ensure numeric fields are numbers (pg may return Decimal for minPrice)
  return (rows || []).map((r) => ({
    ...r,
    bookings: Number(r.bookings || 0),
    minPrice: Number(r.minPrice || 0),
    avgDurationMinutes: Number(r.avgDurationMinutes || 0),
  }))
}

export const routeModel = {
  createRoute,
  updateRoute,
  deleteRoute,
  findById,
  findMany,
  findUsedStopIds,
  getRoutes,
  fullTextSearchRoutes,
  getPopularRoutes,
}