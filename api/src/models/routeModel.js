import { GET_DB } from '~/config/prisma'

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


export const routeModel = {
  createRoute,
  updateRoute,
  deleteRoute,
  findById,
  findMany,
  findUsedStopIds,
}
