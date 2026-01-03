# Bus Ticket Booking Project Deployment Guide

## Overview

This project is a bus ticket booking system with:
- **Frontend**: Next.js 16 with TypeScript, deployed on Vercel
- **Backend**: Node.js/Express with Prisma ORM, deployed on Render
- **Database**: PostgreSQL on Render
- **Real-time**: Socket.io for chatbot

## System Requirements

- Node.js >= 18
- npm
- PostgreSQL (for local development)
- Git

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/tgkhang/bus-ticket-booking.git
cd bus-ticket-booking
```

### 2. Install Dependencies

#### Backend (API)
```bash
cd api
npm install
```

#### Frontend (Web)
```bash
cd ../web
npm install
```

### 3. Database Setup

#### Local: Using Docker
- Ensure Docker and Docker Compose are installed
- Run command to initialize database:
  ```bash
  cd api
  docker-compose up -d
  ```
- DATABASE_URL in `.env`: `postgresql://demo:demo123@localhost:5432/bus_ticket_db`
- To stop database: `docker-compose down`
- To view logs: `docker-compose logs -f postgres`

#### Option 2: Using Local PostgreSQL
- Install PostgreSQL on your machine
- Create new database: `bus_ticket_booking`

#### Production: Using Render PostgreSQL
- Create PostgreSQL instance on [Render](https://render.com)
- Copy external database URL to replace DATABASE_URL in `.env`

### 4. Environment Variables Configuration

Create `.env` file in `api/` directory (copy from `.env.example` and fill in values):

```env
# Database Configuration
DATABASE_URL=postgresql://demo:demo123@localhost:5432/bus_ticket_db

# Server Configuration
LOCAL_DEV_APP_HOST=localhost
LOCAL_DEV_APP_PORT=8017
BUILD_MODE=dev

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

PORT=8010
WEBSITE_DOMAIN_DEVELOPMENT=http://localhost:3000
WEBSITE_DOMAIN_PRODUCTION=https://your-production-domain.com
API_DOMAIN_DEVELOPMENT=http://localhost:8010
API_DOMAIN_PRODUCTION=https://your-production-api.com

# Email Configuration (Brevo)
BREVO_API_KEY=your-brevo-api-key
ADMIN_EMAIL_ADDRESS=admin@yourdomain.com
ADMIN_EMAIL_NAME=Admin

# JWT Tokens
ACCESS_JWT_SECRET_KEY=your_access_jwt_secret_key
ACCESS_JWT_EXPIRES_IN=3h
REFRESH_JWT_SECRET_KEY=your_refresh_jwt_secret_key
REFRESH_JWT_EXPIRES_IN=14d

# Payment (PayOS)
PAYOS_CLIENT_ID=your-payos-client-id
PAYOS_API_KEY=your-payos-api-key
PAYOS_CHECKSUM_KEY=your-payos-checksum-key

# Redis (for production)
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloud-api-key
CLOUDINARY_API_SECRET=your-cloud-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/v1/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:8000/v1/auth/facebook/callback
```

Create `.env.local` file in `web/` directory:

```env
BUILD_MODE=dev
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8010

# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
```

### 5. Initialize Database

```bash
cd api
npx prisma migrate dev
npx prisma db seed
```

### 6. Run Project

#### Terminal 1: Backend
```bash
cd api
npm run dev
```
Server will run on `http://localhost:8010`

#### Terminal 2: Frontend
```bash
cd web
npm run dev
```
Frontend will run on `http://localhost:3000`

### 7. Testing

- Access `http://localhost:3000` to view frontend
- API endpoints available at `http://localhost:8010/api/v1/`
- Check database with Prisma Studio: `npx prisma studio`

## Production Deployment

### 1. Prepare Repository

```bash
git checkout main
git pull origin main
```

### 2. Deploy Database

#### On Render
1. Create PostgreSQL instance on Render
2. Copy database URL (external connection) and replace DATABASE_URL in `.env` in VSCode
3. Run migration via terminal:
   ```bash
   cd api
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 3. Deploy Backend

#### On Render
1. Create Web Service on Render
2. Connect to GitHub repository
3. Configure build settings:
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Add Environment Variables (similar to `.env` but with production values)
5. Deploy

### 4. Deploy Frontend

#### Option 1: Using Vercel Dashboard
1. Import project from GitHub
2. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Backend URL on Render (example: `https://your-api.onrender.com`)
   - `APP_BASE_URL`: Frontend URL on Vercel (example: `https://your-app.vercel.app`)
   - Auth0 variables: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`
4. Deploy

#### Option 2: Using Vercel CLI
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root (specify web directory):
   ```bash
   vercel --prod --cwd web
   ```

4. Set environment variables (or configure in dashboard):
   ```bash
   vercel env add NEXT_PUBLIC_API_URL --cwd web
   vercel env add APP_BASE_URL --cwd web
   vercel env add AUTH0_DOMAIN --cwd web
   vercel env add AUTH0_CLIENT_ID --cwd web
   vercel env add AUTH0_CLIENT_SECRET --cwd web
   vercel env add AUTH0_SECRET --cwd web
   ```

5. Redeploy after setting environment variables:
   ```bash
   vercel --prod --cwd web
   ```

### 5. Domain Configuration (Optional)

- Update `WEBSITE_DOMAIN_PRODUCTION` and `API_DOMAIN_PRODUCTION` in backend environment with actual URLs
- Update `NEXT_PUBLIC_API_URL` and `APP_BASE_URL` in frontend environment with actual URLs
- Update Auth0 Application settings with production URLs
- Update CORS origins in backend if needed

## Troubleshooting

### Database Issues
- **Migration fails**: Ensure DATABASE_URL is correct and database is accessible
- **Seed fails**: Check `prisma/seed.js` file and data files
- **Connection timeout**: Check firewall and network settings

### Socket.io Issues
- **404 WebSocket**: Ensure server uses `httpServer.listen()` instead of `app.listen()`
- **CORS errors**: Check `FRONTEND_URL` in environment

### Build Issues
- **Prisma generate fails**: Run `npx prisma generate` before build
- **Dependencies missing**: Ensure `npm install` runs successfully

### Deployment Issues
- **Render build fails**: Check build logs and environment variables
- **Vercel deploy fails**: Ensure root directory is `web/`
- **API calls fail after deploy**: Check if `NEXT_PUBLIC_API_URL` matches backend URL on Render
- **Auth0 callback URLs**: Update with Vercel production domains
- **CORS errors**: Ensure `WEBSITE_DOMAIN_PRODUCTION` in backend matches Vercel URL
- **Slow first request**: May be due to Render free tier waking up from sleep mode (usually 30-60 seconds)

### Performance
- **Slow queries**: Add indexes in Prisma schema
- **Memory issues**: Increase RAM on Render (paid plans)
- **Rate limiting**: Implement rate limiting middleware
- **Cold starts**: On free tier, service will be slow when waking up from sleep mode

## Monitoring & Maintenance

### Logs
- **Render**: View logs in dashboard
- **Vercel**: View function logs and build logs

### Database
- **Backup**: Render automatically backs up (free tier: 7 days)
- **Monitoring**: Use Render metrics or third-party tools

### Free Tier Limitations
- **Render Free Tier**: Service automatically sleeps after 15 minutes of inactivity. First access will take 30-60 seconds to wake up
- **Cold Start**: After sleeping, first request will be slower than normal

### Updates
```bash
# Update dependencies
npm update

# Update Prisma
npx prisma migrate dev
npx prisma generate

# Test locally before deploying
```