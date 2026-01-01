import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'
import { env } from '~/config/environment'

// Cookie options helper
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: env.BUILD_MODE === 'production',
  sameSite: env.BUILD_MODE === 'production' ? 'none' : 'lax',
  maxAge,
})

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body, false)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body, req)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body, req)

    // Set cookies with proper expiry
    const accessTokenMaxAge = ms(env.ACCESS_JWT_EXPIRES_IN || '1h')
    const refreshTokenMaxAge = ms(env.REFRESH_JWT_EXPIRES_IN || '14d')

    res.cookie('accessToken', result.accessToken, getCookieOptions(accessTokenMaxAge))
    res.cookie('refreshToken', result.refreshToken, getCookieOptions(refreshTokenMaxAge))

    // Don't send tokens in response body - they're in httpOnly cookies
    const { accessToken, refreshToken, ...userDataWithoutTokens } = result
    res.status(StatusCodes.OK).json(userDataWithoutTokens)
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken, req)

    // Set new cookies (rotation - both tokens are new)
    const accessTokenMaxAge = ms(env.ACCESS_JWT_EXPIRES_IN || '1h')
    const refreshTokenMaxAge = ms(env.REFRESH_JWT_EXPIRES_IN || '14d')

    res.cookie('accessToken', result.accessToken, getCookieOptions(accessTokenMaxAge))
    res.cookie('refreshToken', result.refreshToken, getCookieOptions(refreshTokenMaxAge))

    // Don't send tokens in response body
    res.status(StatusCodes.OK).json({ refreshed: true })
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Could not refresh access token, please login again'))
  }
}

import { seatLockService } from '~/services/seatLockService'

const logout = async (req, res, next) => {
  try {
    // Release any locks held by the user
    if (req.user?.id || req.jwtDecoded?.id) {
      const userId = req.user?.id || req.jwtDecoded?.id
      const unlocked = await seatLockService.unlockAllUserLocks(userId)
      if (unlocked) {
        Object.keys(unlocked).forEach((tripId) => {
          req.io.emit('seats:unlocked', {
            tripId,
            seatIds: unlocked[tripId],
          })
        })
      }
    }

    await userService.logout(req.cookies?.refreshToken, req)

    // Clear cookies with same options used when setting
    const clearOptions = {
      httpOnly: true,
      secure: env.BUILD_MODE === 'production',
      sameSite: env.BUILD_MODE === 'production' ? 'none' : 'lax',
    }

    res.clearCookie('accessToken', clearOptions)
    res.clearCookie('refreshToken', clearOptions)
    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded.id
    const result = await userService.logoutAllDevices(userId)

    // Clear current device cookies
    const clearOptions = {
      httpOnly: true,
      secure: env.BUILD_MODE === 'production',
      sameSite: env.BUILD_MODE === 'production' ? 'none' : 'lax',
    }

    res.clearCookie('accessToken', clearOptions)
    res.clearCookie('refreshToken', clearOptions)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const result = await userService.forgotPassword(req.body, req)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.body, req)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  const userId = req.jwtDecoded.id
  const userAvatarFile = req.file
  // console.log('userAvatarFile:', userAvatarFile)
  const updatedUser = await userService.update(userId, req.body, userAvatarFile)
  res.status(StatusCodes.OK).json(updatedUser)
}

const getMe = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded.id
    const user = await userService.getMe(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const oauthGoogleLogin = async (req, res, next) => {
  try {
    const result = await userService.oauthGoogleLogin(req.body, req)

    // Set cookies with proper expiry (same as regular login)
    const accessTokenMaxAge = ms(env.ACCESS_JWT_EXPIRES_IN || '1h')
    const refreshTokenMaxAge = ms(env.REFRESH_JWT_EXPIRES_IN || '14d')

    res.cookie('accessToken', result.accessToken, getCookieOptions(accessTokenMaxAge))
    res.cookie('refreshToken', result.refreshToken, getCookieOptions(refreshTokenMaxAge))

    // Don't send tokens in response body
    const { accessToken, refreshToken, ...userDataWithoutTokens } = result
    res.status(StatusCodes.OK).json(userDataWithoutTokens)
  } catch (error) {
    next(error)
  }
}

// List users (admin)
const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers(req.query)
    res.status(StatusCodes.OK).json(users)
  } catch (error) {
    next(error)
  }
}

// Create user (admin)
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createNew(req.body, true)
    res.status(StatusCodes.CREATED).json(user)
  } catch (error) {
    next(error)
  }
}

// Update user (admin)
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateByAdmin(req.params.id, req.body)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

// Delete user (admin)
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id)
    res.status(StatusCodes.NO_CONTENT).end()
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
  update,
  getMe,
  oauthGoogleLogin,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
}
