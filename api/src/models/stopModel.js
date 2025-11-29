import { GET_DB } from '~/config/prisma'

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

export const stopModel = {
  createStop,
  updateStop,
  deleteStop,
  findById,
  findMany,
}
