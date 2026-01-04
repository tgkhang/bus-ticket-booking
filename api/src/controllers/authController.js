import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { authService } from '~/services/authService'
import { env } from '~/config/environment'

// Cookie options helper
const getCookieOptions = (maxAge) => {
  const options = {
    httpOnly: true,
    secure: env.BUILD_MODE === 'production',
    sameSite: env.BUILD_MODE === 'production' ? 'none' : 'lax',
    maxAge,
  }
  
  // Only set domain for localhost in development
  if (env.BUILD_MODE !== 'production') {
    options.domain = 'localhost'
  }
  
  return options
}

/**
 * Handle OAuth callback for any provider (Google, Facebook, etc.)
 * This is called after passport.authenticate() successfully authenticates the user
 * and attaches the user object to req.user
 */
const handleOAuthCallback = async (req, res, provider) => {
  try {
    console.log(`[${provider} OAuth] Callback received`)
    
    // req.user is set by Passport after successful OAuth authentication
    if (!req.user) {
      console.log(`[${provider} OAuth] No user found in request`)
      return res.redirect(`${env.WEB_URL}/login?error=auth_failed&provider=${provider}`)
    }

    console.log(`[${provider} OAuth] User authenticated:`, req.user.email || req.user.id)

    // Generate tokens using the authenticated user
    const { accessToken, refreshToken } = await authService.generateOAuthTokens(req.user, 'web')

    // Set cookies with proper expiry
    const accessTokenMaxAge = ms(env.ACCESS_JWT_EXPIRES_IN || '1h')
    const refreshTokenMaxAge = ms(env.REFRESH_JWT_EXPIRES_IN || '14d')

    const cookieOptions = getCookieOptions(accessTokenMaxAge)
    console.log(`[${provider} OAuth] Setting cookies with options:`, cookieOptions)

    res.cookie('accessToken', accessToken, getCookieOptions(accessTokenMaxAge))
    res.cookie('refreshToken', refreshToken, getCookieOptions(refreshTokenMaxAge))

    const redirectUrl = `${env.WEB_URL}/?login=success&provider=${provider}`
    console.log(`[${provider} OAuth] Redirecting to:`, redirectUrl)

    // Redirect to frontend with success
    res.redirect(redirectUrl)
  } catch (error) {
    console.error(`${provider} OAuth callback error:`, error)
    res.redirect(`${env.WEB_URL}/login?error=server_error&provider=${provider}`)
  }
}

/**
 * Handle Google OAuth callback
 */
const handleGoogleCallback = async (req, res) => {
  await handleOAuthCallback(req, res, 'google')
}

/**
 * Handle Facebook OAuth callback
 */
const handleFacebookCallback = async (req, res) => {
  await handleOAuthCallback(req, res, 'facebook')
}

export const authController = {
  handleOAuthCallback,
  handleGoogleCallback,
  handleFacebookCallback,
}
