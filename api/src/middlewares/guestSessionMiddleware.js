import crypto from 'crypto'
import { env } from '~/config/environment'

const COOKIE_NAME = 'guestSid'

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: env.BUILD_MODE === 'production',
  sameSite: env.BUILD_MODE === 'production' ? 'none' : 'lax',
  maxAge,
})

// Ensures a stable guest session id via cookie.
// This is used for seat locking + guest booking flows.
const ensureGuestSession = (req, res, next) => {
  const existing = req.cookies?.[COOKIE_NAME]
  if (existing && typeof existing === 'string' && existing.length >= 16) {
    req.guestSid = existing
    next()
    return
  }

  const sid = crypto.randomUUID()
  req.guestSid = sid
  // 30 days
  res.cookie(COOKIE_NAME, sid, getCookieOptions(30 * 24 * 60 * 60 * 1000))
  next()
}

export const guestSessionMiddleware = {
  ensureGuestSession,
  COOKIE_NAME,
}
