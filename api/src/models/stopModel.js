import { GET_DB } from '~/config/prisma'

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

const searchStops = async (query, limit = 10) => {
  try {
    const prisma = GET_DB()
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
    })
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
  getStops,
}
