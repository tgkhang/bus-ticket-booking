# Auth0 OAuth Integration Guide

## Table of Contents
- [Overview](#overview)
- [What We Implemented](#what-we-implemented)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [Team Collaboration](#team-collaboration)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project uses **Auth0** for Google OAuth authentication, integrated with our existing cookie-based JWT authentication system. Users can sign in with Google, and their account is automatically synced with our PostgreSQL database.

### Key Features
- ✅ Google OAuth login via Auth0
- ✅ Automatic user creation/update in database
- ✅ Cookie-based JWT authentication (accessToken, refreshToken)
- ✅ Account selection on every login
- ✅ Seamless integration with existing auth system

---

## What We Implemented

### Frontend (Next.js)

**New Files Created:**
- `web/src/lib/auth/auth0.ts` - Auth0 client instance
- `web/src/proxy.ts` - Auth0 middleware for Next.js 16
- `web/src/app/api/auth/oauth/login/route.ts` - OAuth sync handler
- `web/src/app/auth/oauth-success/page.tsx` - Loading page after OAuth

**Modified Files:**
- `web/src/app/(auth)/login/page.tsx` - Added Google login button
- `web/src/app/(auth)/register/page.tsx` - Added Google signup button

### Backend (Express.js + Prisma)

**Database Schema Updates:**
```prisma
model User {
  // ... existing fields

  // OAuth fields (NEW)
  oauthProvider   String?   // google, facebook, etc.
  oauthSub        String?   @unique // Auth0 user ID
  isOauthUser     Boolean   @default(false)
}
```

**New Backend Code:**
- `api/src/models/userModel.js` - Added `findOneByOauthSub()`, `createOAuthUser()`
- `api/src/services/userService.js` - Added `oauthGoogleLogin()` business logic
- `api/src/controllers/userController.js` - Added `oauthGoogleLogin()` controller
- `api/src/routes/v1/userRoute.js` - Added `POST /v1/users/oauth/google` route

---

## How It Works

### Complete OAuth Flow

```
1. User clicks "Login with Google" on login/register page
   ↓
2. Redirects to Auth0
   URL: /auth/login?connection=google-oauth2&prompt=select_account
   ↓
3. Auth0 shows Google account selection
   ↓
4. User selects Google account and authorizes
   ↓
5. Google redirects back to Auth0 with authorization code
   ↓
6. Auth0 redirects to: /auth/callback
   ↓
7. proxy.ts intercepts callback → redirects to /api/auth/oauth/login
   ↓
8. OAuth Login Handler (/api/auth/oauth/login/route.ts):
   - Gets Auth0 session (contains user email, name, picture, sub)
   - Makes POST request to backend: http://localhost:8010/v1/users/oauth/google
   ↓
9. Backend (Express.js):
   - Checks if user exists (by email or oauthSub)
   - If exists: Update user with OAuth info
   - If not exists: Create new OAuth user
   - Generates JWT tokens (accessToken, refreshToken)
   - Sets httpOnly cookies in response
   ↓
10. OAuth handler forwards cookies to browser
    - Extracts Set-Cookie headers from backend response
    - Adds them to redirect response
    - Redirects to /auth/oauth-success
    ↓
11. OAuth Success Page:
    - Waits for AuthContext to initialize
    - AuthContext calls /me API using cookies
    - Once authenticated, redirects to /
    ↓
12. User is logged in! 🎉
```

### Key Technical Details

**Cookie Forwarding (Critical):**
The OAuth handler uses direct axios calls to capture cookies from the backend:

```typescript
// web/src/app/api/auth/oauth/login/route.ts
const backendResponse = await axios.post(`${API_ROOT}/v1/users/oauth/google`, userData);
const setCookieHeaders = backendResponse.headers['set-cookie'];

// Forward cookies to browser
if (setCookieHeaders) {
  setCookieHeaders.forEach(cookie => {
    redirectResponse.headers.append('Set-Cookie', cookie);
  });
}
```

This ensures cookies set by the backend reach the user's browser, not the Next.js server.

---

## Environment Variables

### Frontend Environment Variables

**File: `web/.env.local`**

```env
# Auth0 Configuration
AUTH0_SECRET=<your_secret_here>  # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=<your_auth0_domain>  # e.g., dev-xxxxxxxx.us.auth0.com
AUTH0_CLIENT_ID=<your_client_id>
AUTH0_CLIENT_SECRET=<your_client_secret>

# API endpoint
NEXT_PUBLIC_API_ROOT=http://localhost:8010
```

**Variable Descriptions:**

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH0_SECRET` | 32-character random string for session encryption | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `APP_BASE_URL` | Your frontend URL | `http://localhost:3000` (dev)<br>`https://busbook.com` (prod) |
| `AUTH0_DOMAIN` | Auth0 tenant domain (no https://) | `dev-xxxxxxxx.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | Found in Auth0 dashboard |
| `AUTH0_CLIENT_SECRET` | Auth0 application secret | Found in Auth0 dashboard |

### Backend Environment Variables

**File: `api/.env`**

No new variables needed! Existing variables support OAuth:

```env
# Existing variables (no changes needed)
DATABASE_URL=postgresql://...
BUILD_MODE=dev  # Change to 'production' for deployment
ACCESS_JWT_SECRET_KEY=your_secret
REFRESH_JWT_SECRET_KEY=your_secret
ACCESS_JWT_EXPIRES_IN=1h
REFRESH_JWT_EXPIRES_IN=14d
```

---

## Team Collaboration

### Recommended Approach: Shared Development Credentials

For our team, we use **the same Auth0 application** for development.

### Setup for New Team Members

**Step 1: Clone repository**
```bash
git clone <repository-url>
cd bus-ticket-booking
```

**Step 2: Copy environment template**
```bash
cp web/.env.local.example web/.env.local
```

**Step 3: Get credentials from team lead**
Ask the team lead for Auth0 credentials via:
- Discord DM
- Telegram
- Email
- Shared password manager

**Step 4: Paste values into `.env.local`**
```env
AUTH0_SECRET=<get_from_team_lead>  # 32-character hex string
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=<get_from_team_lead>  # Auth0 tenant domain
AUTH0_CLIENT_ID=<get_from_team_lead>  # Auth0 client ID
AUTH0_CLIENT_SECRET=<get_from_team_lead>  # Auth0 client secret
NEXT_PUBLIC_API_ROOT=http://localhost:8010
```

**Step 5: Install and run**
```bash
# Install frontend dependencies
cd web
npm install
npm run dev

# Install backend dependencies (separate terminal)
cd api
npm install
npm run dev
```

### Security Best Practices

**✅ DO:**
- Add `.env.local` to `.gitignore` (already done)
- Share secrets via encrypted channels (DM, password manager)
- Use different secrets for production
- Rotate secrets if accidentally committed

**❌ DON'T:**
- Commit `.env.local` to Git
- Share secrets in public channels
- Use same secrets for dev and production
- Hardcode secrets in source code

---

## Production Deployment

### Step 1: Update Auth0 Dashboard

Go to https://manage.auth0.com → Your Application → Settings

**Update these URLs:**

**Allowed Callback URLs:**
```
https://busbook.com/auth/callback
```

**Allowed Logout URLs:**
```
https://busbook.com
```

**Allowed Web Origins:**
```
https://busbook.com
```

### Step 2: Production Environment Variables

**Frontend (`web/.env.production`):**
```env
# Auth0 Configuration - PRODUCTION
AUTH0_SECRET=<GENERATE_NEW_SECRET>  # ⚠️ Generate new secret!
APP_BASE_URL=https://busbook.com
AUTH0_DOMAIN=<your_auth0_domain>  # e.g., dev-xxxxxxxx.us.auth0.com
AUTH0_CLIENT_ID=<your_production_client_id>
AUTH0_CLIENT_SECRET=<your_production_client_secret>

# Production API
NEXT_PUBLIC_API_ROOT=https://api.busbook.com
```

**Generate NEW production secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Backend (`api/.env` production):**
```env
BUILD_MODE=production  # ⚠️ Important! Sets secure cookies
# ... rest stays the same
```

### Step 3: Update CORS Settings

**File: `api/src/config/cors.js`**
```javascript
const corsOptions = {
  origin: 'https://busbook.com',  // Update to production URL
  credentials: true,
}
```

### Step 4: Google OAuth Redirect URIs

If using Google Cloud Console directly:
1. Go to https://console.cloud.google.com
2. Navigate to **APIs & Services** → **Credentials**
3. Update **Authorized redirect URIs**:
   ```
   https://<your_auth0_domain>/login/callback
   ```

---

## Troubleshooting

### Issue: "No session found" error

**Problem:** OAuth callback fails with no session

**Solution:**
- Check `AUTH0_SECRET` is set correctly
- Verify `APP_BASE_URL` matches your frontend URL
- Clear browser cookies and try again

### Issue: Redirect loop after OAuth login

**Problem:** User redirects between / and /login

**Solution:**
- Check cookies are being set (inspect Network tab → Response headers)
- Verify backend is returning `Set-Cookie` headers
- Ensure `BUILD_MODE` is set correctly (dev vs production)

### Issue: "Invalid URL" from Auth0

**Problem:** Auth0 configuration error

**Solution:**
- Check `AUTH0_DOMAIN` has NO `https://` prefix
- Verify `APP_BASE_URL` has full URL with protocol
- Update callback URLs in Auth0 dashboard

### Issue: Google login shows wrong account

**Problem:** Always logs in with previous Google account

**Solution:**
- Verify login URL has `prompt=select_account` parameter
- Should be: `/auth/login?connection=google-oauth2&prompt=select_account`

### Issue: Cookies not reaching browser

**Problem:** Backend sets cookies but browser doesn't receive them

**Solution:**
- Check OAuth handler forwards `Set-Cookie` headers
- Verify `withCredentials: true` in axios call
- Ensure CORS allows credentials

---

## Database Migration

If database doesn't have OAuth fields yet:

```bash
cd api
npx prisma migrate dev --name add_oauth_fields
```

This adds:
- `oauthProvider` (String, nullable)
- `oauthSub` (String, unique, nullable)
- `isOauthUser` (Boolean, default false)

---

## Testing OAuth Flow

### Manual Test Steps

1. **Start both servers:**
   ```bash
   # Terminal 1 - Frontend
   cd web && npm run dev

   # Terminal 2 - Backend
   cd api && npm run dev
   ```

2. **Open browser:** http://localhost:3000/login

3. **Click "Google" button**

4. **Select Google account**

5. **Check for success:**
   - Should redirect to /
   - Check cookies in DevTools → Application → Cookies
   - Should see `accessToken` and `refreshToken`

6. **Verify database:**
   ```sql
   SELECT email, username, displayName, isOauthUser, oauthProvider
   FROM users
   WHERE isOauthUser = true;
   ```

### Expected Results

**Console logs (frontend):**
```
OAuth Login Handler - Session: Found
Auth0 User: { email: '...', name: '...', sub: 'google-oauth2|...' }
Calling backend API with: { email, name, picture, sub }
Backend API success: { id, email, username, displayName, ... }
```

**Database:**
```
email: user@gmail.com
username: user123
isOauthUser: true
oauthProvider: google
oauthSub: google-oauth2|105195204449486674011
password: null
```

---

## Additional Resources

- **Auth0 Documentation:** https://auth0.com/docs
- **Auth0 Next.js SDK:** https://github.com/auth0/nextjs-auth0
- **Google OAuth Setup:** https://developers.google.com/identity/protocols/oauth2

---

## Support

For issues or questions:
1. Check this documentation first
2. Review error logs in browser console and server terminal
3. Ask team lead for help
4. Check Auth0 dashboard for error logs

---

**Last Updated:** 2025-01-26
**Implemented By:** Development Team
**Auth0 SDK Version:** @auth0/nextjs-auth0@4.13.1
