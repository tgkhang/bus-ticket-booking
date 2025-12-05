import { GET_DB } from '~/config/prisma'

const includeRelations = {
  buses: {
    orderBy: { plateNumber: 'asc' }
  },
  routes: {
    orderBy: { name: 'asc' }
  }
}

// ============================================
// OPERATOR CRUD OPERATIONS
// ============================================

const createOperator = async (data) => {
  try {
    const prisma = GET_DB()

    return await prisma.operator.create({
      data: {
        name: data.name,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        status: data.status || 'pending',
        approvedAt: data.status === 'approved' ? new Date() : null,
      },
      include: includeRelations,
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findOperatorById = async (id) => {
  try {
    const prisma = GET_DB()
    return await prisma.operator.findUnique({
      where: { id },
      include: includeRelations,
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findOperatorByEmail = async (email) => {
  try {
    const prisma = GET_DB()
    return await prisma.operator.findFirst({
      where: { contactEmail: email },
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findAllOperators = async (filters = {}, pagination = {}) => {
  try {
    const prisma = GET_DB()
    const { status, search } = filters
    const { page = 1, limit = 20 } = pagination

    const skip = (page - 1) * limit
    const take = parseInt(limit)

    // Build where clause
    const where = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await prisma.operator.count({ where })

    // Get operators
    const operators = await prisma.operator.findMany({
      where,
      skip,
      take,
      include: includeRelations,
      orderBy: { name: 'asc' },
    })

    return {
      data: operators,
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

const updateOperator = async (id, data) => {
  try {
    const prisma = GET_DB()

    const updateData = {}

    if (data.name) updateData.name = data.name
    if (data.contactEmail) updateData.contactEmail = data.contactEmail
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone || null
    if (data.status) {
      updateData.status = data.status
      // Set approved_at when status changes to approved
      if (data.status === 'approved') {
        updateData.approvedAt = new Date()
      }
    }

    const updated = await prisma.operator.update({
      where: { id },
      data: updateData,
      include: includeRelations,
    })

    return updated
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOperator = async (id) => {
  try {
    const prisma = GET_DB()
    return await prisma.operator.delete({
      where: { id },
    })
  } catch (error) {
    throw new Error(error)
  }
}

// ============================================
// OPERATOR-SPECIFIC QUERIES
// ============================================

const checkOperatorHasActiveResources = async (operatorId) => {
  try {
    const prisma = GET_DB()

    // Check for buses
    const busCount = await prisma.bus.count({
      where: { operatorId: operatorId },
    })

    // Check for routes
    const routeCount = await prisma.route.count({
      where: { operatorId: operatorId },
    })

    return {
      hasBuses: busCount > 0,
      hasRoutes: routeCount > 0,
      hasAny: busCount > 0 || routeCount > 0,
      counts: {
        buses: busCount,
        routes: routeCount,
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getOperatorWithDetails = async (operatorId) => {
  try {
    const prisma = GET_DB()

    const operator = await prisma.operator.findUnique({
      where: { id: operatorId },
      include: {
        buses: {
          orderBy: { plateNumber: 'asc' },
          include: {
            seats: {
              where: { isActive: true },
            },
          },
        },
        routes: {
          orderBy: { name: 'asc' },
          include: {
            originStop: true,
            destinationStop: true,
          },
        },
      },
    })

    return operator
  } catch (error) {
    throw new Error(error)
  }
}

const getOperatorStatistics = async (operatorId) => {
  try {
    const prisma = GET_DB()

    const [busCount, routeCount, tripCount] = await Promise.all([
      prisma.bus.count({ where: { operatorId: operatorId } }),
      prisma.route.count({ where: { operatorId: operatorId } }),
      prisma.trip.count({
        where: {
          route: {
            operatorId: operatorId
          }
        }
      })
    ])

    return {
      totalBuses: busCount,
      totalRoutes: routeCount,
      totalTrips: tripCount,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const operatorModel = {
  createOperator,
  findOperatorById,
  findOperatorByEmail,
  findAllOperators,
  updateOperator,
  deleteOperator,
  checkOperatorHasActiveResources,
  getOperatorWithDetails,
  getOperatorStatistics,
}
