import { GET_DB } from '~/config/prisma'
import { USER_ROLES } from '~/utils/constants'

const INVALID_UPDATE_FIELDS = ['id', 'email', 'createdAt', 'updatedAt', 'username']

const createNew = async (data) => {
  try {
    const prisma = GET_DB()
    const createdUser = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
        displayName: data.displayName,
        avatar: data.avatar || null,
        role: data.role || USER_ROLES.CLIENT,
        isActive: data.isActive || false,
        verifyToken: data.verifyToken || null,
        verifyTokenExpiry: data.verifyTokenExpiry || null,
      },
    })
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (userId) => {
  try {
    const prisma = GET_DB()
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email) => {
  try {
    const prisma = GET_DB()
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const findByPasswordResetToken = async (token) => {
  try {
    const prisma = GET_DB()
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, updateData) => {
  try {
    // Remove invalid update fields
    Object.keys(updateData).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })

    const prisma = GET_DB()
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })
    return updatedUser
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByOauthSub = async (oauthSub) => {
  try {
    const prisma = GET_DB()
    const user = await prisma.user.findUnique({
      where: { oauthSub },
    })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const createOAuthUser = async (data) => {
  try {
    const prisma = GET_DB()
    const createdUser = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        displayName: data.name,
        avatar: data.picture || null,
        role: USER_ROLES.CLIENT,
        isActive: true, // OAuth users are auto-verified
        oauthProvider: data.provider || 'google',
        oauthSub: data.sub,
        isOauthUser: true,
        password: null, // OAuth users don't have passwords
      },
    })
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

// Get list of users (admin)
const listUsers = async (query) => {
  try {
    const prisma = GET_DB();
    const { search, role, page = 1, limit = 20 } = query || {};
    const where = {};
    
    // Search in email, username, and displayName (case insensitive)
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) where.role = role;

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(error);
  }
};

// Admin update user
const updateByAdmin = async (id, data) => {
  try {
    const prisma = GET_DB();
    
    // Remove invalid fields that don't exist in schema
    const validData = { ...data };
    delete validData.id;
    delete validData.createdAt;
    delete validData.updatedAt;
    
    // Map 'name' to 'displayName'
    if (validData.name) {
      validData.displayName = validData.name;
      delete validData.name;
    }
    
    return await prisma.user.update({
      where: { id },
      data: validData,
    });
  } catch (error) {
    throw new Error(error);
  }
};

// Admin delete user
const deleteUser = async (id) => {
  try {
    const prisma = GET_DB();
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const userModel = {
  USER_ROLES,
  createNew,
  findOneById,
  findOneByEmail,
  findByPasswordResetToken,
  findOneByOauthSub,
  createOAuthUser,
  update,
  listUsers,
  updateByAdmin,
  deleteUser,
}
