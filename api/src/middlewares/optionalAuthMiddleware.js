import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

// Like authMiddleware.isAuthorized, but never blocks the request.
// If a valid accessToken cookie is present, it populates req.jwtDecoded.
const tryAuthorize = async (req, _res, next) => {
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    next()
    return
  }

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_JWT_SECRET_KEY)
    req.jwtDecoded = {
      ...accessTokenDecoded,
      id: accessTokenDecoded.id || accessTokenDecoded._id,
    }
  } catch {
    // ignore invalid/expired token for optional auth
  }

  next()
}

export const optionalAuthMiddleware = {
  tryAuthorize,
}
