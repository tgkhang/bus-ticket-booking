import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ms from 'ms'
import { GET_DB } from '~/config/prisma'
import { v4 as uuidv4 } from 'uuid'

/**
 * Find or create OAuth user from provider profile
 * This handles both new OAuth users and linking OAuth to existing accounts
 */
const findOrCreateOAuthUser = async (profile, provider) => {
  const { id, emails, displayName, photos, name } = profile
  // reason use emails[0]?.value: some providers may not return email
  const email = emails && emails[0]?.value
  const picture = photos && photos[0]?.value

  // Check if user exists by OAuth sub first
  let user = await userModel.findOneByOauthSub(id)

  // If email is available, also check by email
  if (!user && email) {
    user = await userModel.findOneByEmail(email)
  }

  if (user) {
    // Update existing user with OAuth info if not already linked
    if (!user.oauthSub || user.oauthSub !== id) {
      user = await userModel.update(user.id, {
        oauthProvider: provider,
        oauthSub: id,
        isOauthUser: true,
        isActive: true, // Auto-activate OAuth users
      })
    }
  } else {
    // Create new OAuth user
    // Generate email from OAuth ID if not provided
    const userEmail = email || `${provider}_${id}@oauth.placeholder`
    let username = email ? email.split('@')[0] : `${provider}_${id.slice(0, 8)}`

    const existingUsername = await GET_DB().user.findUnique({ where: { username } })
    if (existingUsername) {
      username = `${username}_${uuidv4().slice(0, 8)}`
    }

    user = await userModel.createOAuthUser({
      email: userEmail,
      username,
      name: displayName || (name ? `${name.givenName} ${name.familyName}` : username),
      picture,
      sub: id,
      provider,
    })
  }

  return user
}

/**
 * Generate JWT tokens and store refresh token in database
 * Used after successful OAuth login
 */
const generateOAuthTokens = async (user, familyId = 'web') => {
  try {
    // Get staff info if user is staff
    let staffId = null
    if (user.role === 'staff') {
      const staff = await GET_DB().staff.findUnique({
        where: { userId: user.id },
      })
      staffId = staff?.id || null
    }

    let operatorId = null
    if (user.role === 'operator') {
      const operator = await GET_DB().operator.findUnique({
        where: { userId: user.id },
      })
      operatorId = operator?.id || null
    }

    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role,
      ...(staffId && { staffId }),
      ...(operatorId && { operatorId }),
    }

    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_JWT_SECRET_KEY, env.ACCESS_JWT_EXPIRES_IN)
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_JWT_SECRET_KEY,
      env.REFRESH_JWT_EXPIRES_IN
    )

    // Store refresh token in database
    await GET_DB().refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        familyId,
        expiresAt: new Date(Date.now() + ms(env.REFRESH_JWT_EXPIRES_IN)),
      },
    })

    return {
      accessToken,
      refreshToken,
      user,
    }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to generate tokens')
  }
}

/**
 * Handle OAuth login - find/create user and generate tokens
 * This is the main service method called after OAuth authentication
 */
const handleOAuthLogin = async (oauthProfile, provider) => {
  try {
    // Find or create user from OAuth profile
    const user = await findOrCreateOAuthUser(oauthProfile, provider)

    // Generate tokens for the user
    const tokens = await generateOAuthTokens(user, 'web')

    return tokens
  } catch (error) {
    throw new ApiError(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'OAuth login failed')
  }
}

export const authService = {
  findOrCreateOAuthUser,
  generateOAuthTokens,
  handleOAuthLogin,
}
