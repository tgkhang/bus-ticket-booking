import { GET_DB } from '~/config/prisma'
import { Prisma } from '@prisma/client'

const includeRelations = {
  originRoutes: true,
  destinationRoutes: true,
  routeStops: true,
}

const createStop = async (data) => {
  try {
    const prisma = GET_DB()
    return await prisma.stop.create({
      data: {
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || null,
        active: data.active !== undefined ? data.active : true,
      },
    })
  } catch (error) {
    throw new Error(error)
  }
}

const updateStop = async (id, data) => {
  try {
    const prisma = GET_DB()
    return await prisma.stop.update({
      where: { id },
      data,
    })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteStop = async (id) => {
  try {
    const prisma = GET_DB()
    return await prisma.stop.delete({ where: { id } })
  } catch (error) {
    throw new Error(error)
  }
}

const findById = async (id) => {
  try {
    const prisma = GET_DB()
    return await prisma.stop.findUnique({ where: { id } })
  } catch (error) {
    throw new Error(error)
  }
}

const findMany = async (filter = {}) => {
  try {
    const prisma = GET_DB()
    return await prisma.stop.findMany({ where: filter, orderBy: { name: 'asc' } })
  } catch (error) {
    throw new Error(error)
  }
}

const searchStops = async (query, limit = 10, page = 1) => {
  try {
    const prisma = GET_DB()
    const skip = (page - 1) * limit
    return await prisma.stop.findMany({
      where: {
        AND: [
          { active: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { address: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: { name: 'asc' },
      take: limit,
      skip: skip,
    })
  } catch (error) {
    throw new Error(error)
  }
}

const fullTextSearchStops = async (query, limit = 10, page = 1) => {
  try {
    const prisma = GET_DB()
    const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50))
    const safePage = Math.max(1, Number(page) || 1)
    const skip = (safePage - 1) * safeLimit

    const q = (query || '').trim()

    // Empty query -> browse active stops (paginated)
    if (!q) {
      const [total, data] = await Promise.all([
        prisma.stop.count({ where: { active: true } }),
        prisma.stop.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
          take: safeLimit,
          skip,
        }),
      ])

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

    // Fulltext + fuzzy search with total count
    const [countRows, data] = await Promise.all([
      prisma.$queryRaw(
        Prisma.sql`
          WITH q AS (
            SELECT
              lower(unaccent(${q})) AS raw,
              websearch_to_tsquery('simple', lower(unaccent(${q}))) AS tsq
          )
          SELECT COUNT(*)::int AS total
          FROM stops s, q
          WHERE s.active = TRUE
            AND (
              to_tsvector('simple', coalesce(s.search_text, '')) @@ q.tsq
              OR coalesce(s.search_text, '') % q.raw
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
            s.id,
            s.name,
            s.address,
            s.latitude,
            s.longitude,
            s.active,
            s."createdAt",
            s."updatedAt"
          FROM stops s, q
          WHERE s.active = TRUE
            AND (
              to_tsvector('simple', coalesce(s.search_text, '')) @@ q.tsq
              OR coalesce(s.search_text, '') % q.raw
            )
          ORDER BY
            (to_tsvector('simple', coalesce(s.search_text, '')) @@ q.tsq) DESC,
            ts_rank_cd(to_tsvector('simple', coalesce(s.search_text, '')), q.tsq) DESC,
            similarity(coalesce(s.search_text, ''), q.raw) DESC,
            s.name ASC
          LIMIT ${safeLimit}
          OFFSET ${skip};
        `
      ),
    ])

    const total = Number(countRows?.[0]?.total || 0)

    return {
      data: data || [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getStops = async (filters = {}, pagination = {}) => {
  try {
    const prisma = GET_DB()
    const { name, address, active, search } = filters
    const { page = 1, limit = 20 } = pagination

    const skip = (page - 1) * limit
    const take = parseInt(limit)
    const where = {}

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      }
    }

    if (address) {
      where.address = {
        contains: address,
        mode: 'insensitive',
      }
    }

    if (active !== undefined) {
      where.active = active
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await prisma.stop.count({ where })

    // Get stops
    const stops = await prisma.stop.findMany({
      where,
      skip,
      take,
      include: includeRelations,
      orderBy: { name: 'asc' },
    })

    return {
      data: stops,
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

export const stopModel = {
  createStop,
  updateStop,
  deleteStop,
  findById,
  findMany,
  searchStops,
  fullTextSearchStops,
  getStops,
}
