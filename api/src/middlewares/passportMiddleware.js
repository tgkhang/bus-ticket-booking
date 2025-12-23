import passport from '~/config/passport'

/**
 * Passport JWT middleware that works with your existing system
 * Use this as an alternative to authMiddleware.isAuthorized
 */
const authenticateJWT = passport.authenticate('jwt', { session: false })

/**
 * Wrapper to make Passport errors compatible with your error handling
 */
const isAuthorizedPassport = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      const error = new Error('You are not authorized')
      error.statusCode = 401
      return next(error)
    }

    // Map user to jwtDecoded for compatibility with existing code
    req.jwtDecoded = {
      id: user.id,
      email: user.email,
      role: user.role,
    }
    req.user = user

    next()
  })(req, res, next)
}

export const passportMiddleware = {
  authenticateJWT,
  isAuthorizedPassport,
}
