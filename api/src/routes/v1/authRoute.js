import express from 'express'
import passport from '~/config/passport'
import { env } from '~/config/environment'
import { authController } from '~/controllers/authController'

const Router = express.Router()

// ============================================
// Google OAuth Routes
// ============================================

// Initiate Google OAuth
Router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false, // using JWT, not sessions
  })
)

// Google OAuth callback
Router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${env.WEB_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  authController.handleGoogleCallback
)

// ============================================
// Facebook OAuth Routes
// ============================================

// Initiate Facebook OAuth
Router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['public_profile'], // Remove 'email' - it's not a valid Facebook scope
    session: false,
  })
)

// Facebook OAuth callback
Router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${env.WEB_URL}/login?error=facebook_auth_failed`,
    session: false,
  }),
  authController.handleFacebookCallback
)

export const authRoute = Router