import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { env } from '~/config/environment'
import { userModel } from '~/models/userModel'
import { authService } from '~/services/authService'

// ============================================
// Google OAuth Strategy
// ============================================
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateOAuthUser(profile, 'google')
        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

// ============================================
// Facebook OAuth Strategy
// ============================================
passport.use(
  new FacebookStrategy(
    {
      clientID: env.FACEBOOK_APP_ID,
      clientSecret: env.FACEBOOK_APP_SECRET,
      callbackURL: env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
      scope: ['public_profile'],
      enableProof: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateOAuthUser(profile, 'facebook')
        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

// ============================================
// JWT Strategy (Optional - for API endpoints)
// ============================================
const cookieExtractor = (req) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies.accessToken
  }
  return token
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor, // Extract JWT from cookie
      secretOrKey: env.ACCESS_JWT_SECRET_KEY,
    },
    async (jwtPayload, done) => {
      try {
        const user = await userModel.findOneById(jwtPayload.id)
        if (user) {
          return done(null, user)
        }
        return done(null, false)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

// ============================================
// Session Serialization (NOT USED - we use JWT instead)
// ============================================
// NOTE: These are only needed if using session-based auth with passport.session()
// Currently we use JWT tokens in cookies, so these are not active

// passport.serializeUser((user, done) => {
//   done(null, user.id)
// })

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await userModel.findOneById(id)
//     done(null, user)
//   } catch (error) {
//     done(error, null)
//   }
// })

export default passport
