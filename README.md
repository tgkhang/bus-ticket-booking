# Bus Ticket Booking System

A full-stack web application for booking bus tickets with Google OAuth authentication, built with Next.js and Express.js.

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Authentication Setup](#authentication-setup)
- [Database Management](#database-management)
- [Development Workflow](#development-workflow)
- [Production Build](#production-build)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Project Structure

```
bus-ticket-booking/
├── api/                    # Backend (Express.js + Prisma)
│   ├── prisma/            # Database schema and migrations
│   ├── src/               # Source code
│   ├── docker-compose.yml # PostgreSQL container config
│   ├── .env.example       # Environment variables template
│   └── package.json       # Backend dependencies
│
├── web/                   # Frontend (Next.js + TypeScript)
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── .env.local.example # Environment variables template
│   └── package.json      # Frontend dependencies
│
├── design/               # UI mockups and design files
│   └── *.png            # Design screenshots
│
└── docs/                # Documentation
    ├── UI-design/       # UI component library (React)
    └── AUTH0_OAUTH_SETUP.md # Auth0 setup guide
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bus-ticket-booking
```

### 2. Install Backend Dependencies

```bash
cd api
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../web
npm install
```

## Environment Configuration

### Backend Environment Variables

1. Navigate to the API directory:

```bash
cd api
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Open `.env` and configure the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://demo:demo123@localhost:5432/bus_ticket_db

# Server Configuration
LOCAL_DEV_APP_HOST=localhost
LOCAL_DEV_APP_PORT=8010
BUILD_MODE=dev
PORT=3000

# Frontend URLs
WEBSITE_DOMAIN_DEVELOPMENT=http://localhost:3000
WEBSITE_DOMAIN_PRODUCTION=http://localhost:3000

# JWT Configuration
ACCESS_JWT_SECRET_KEY=your_jwt_secret_key_here
ACCESS_JWT_EXPIRES_IN=3h
REFRESH_JWT_SECRET_KEY=your_refresh_jwt_secret_key_here
REFRESH_JWT_EXPIRES_IN=14d

# Email Configuration (Optional - for notifications)
BREVO_API_KEY=
ADMIN_EMAIL_ADDRESS=
ADMIN_EMAIL_NAME=Admin
```

**Important Notes:**

- Change `ACCESS_JWT_SECRET_KEY` and `REFRESH_JWT_SECRET_KEY` to secure random strings
- Generate secure keys: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Email configuration is optional for development

### Frontend Environment Variables

1. Navigate to the web directory:

```bash
cd ../web
```

2. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

3. Open `.env.local` and configure:

```env
# Environment Configuration
BUILD_MODE=dev
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_ROOT=http://localhost:8010

# Auth0 Configuration
# Generate AUTH0_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH0_SECRET=generate_a_random_32_char_hex_string_here
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=your_auth0_domain_here
AUTH0_CLIENT_ID=your_auth0_client_id_here
AUTH0_CLIENT_SECRET=your_auth0_client_secret_here
```

**Auth0 Configuration:**

For development, you'll need to obtain Auth0 credentials from your team lead or set up your own Auth0 application. See the [Authentication Setup](#authentication-setup) section for detailed instructions.

**Generate AUTH0_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. Start PostgreSQL with Docker

Navigate to the API directory and start the PostgreSQL container:

```bash
cd api
docker compose up -d
```

This starts a PostgreSQL container with:

- **Host:** localhost
- **Port:** 5432
- **Database:** bus_ticket_db
- **Username:** demo
- **Password:** demo123

### 2. Verify PostgreSQL is Running

```bash
docker compose ps
```

You should see the `bus-ticket-postgres` container running.

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema.

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

This creates all necessary tables in your PostgreSQL database, including:

- Users (with OAuth support)
- Operators
- Routes
- Buses
- Trips
- Seats
- Bookings
- Payments
- Notifications
- Feedback

### 5. Seed Sample Data (Optional)

Populate the database with sample data for testing:

```bash
npm run prisma:seed
```

This creates:

- 2 sample users (john.doe@example.com, jane.smith@example.com)
- 1 bus operator (Green Bus Lines)
- 1 route (Ho Chi Minh City to Da Lat)
- 1 bus with 16 seats
- 1 scheduled trip for tomorrow
- Sample payment method

**Test Login Credentials:**

- Email: `john.doe@example.com` or `jane.smith@example.com`
- Password: `password123`

## Running the Application

### Development Mode

You'll need two terminal windows running simultaneously.

**Terminal 1 - Start Backend:**

```bash
cd api
npm run dev
```

Backend will start at `http://localhost:8010`

**Terminal 2 - Start Frontend:**

```bash
cd web
npm run dev
```

Frontend will start at `http://localhost:3000`

### Access the Application

Open your browser and navigate to:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8010
- **Prisma Studio (Database GUI):** Run `npm run prisma:studio` in the API directory

## Authentication Setup

This project uses Auth0 for Google OAuth authentication. Users can sign in with their Google account, and their account is automatically synced with the PostgreSQL database.

### Auth0 Features

- Google OAuth login
- Automatic user creation/update in database
- Cookie-based JWT authentication (accessToken, refreshToken)
- Account selection on every login
- Seamless integration with existing auth system

### Setting Up Auth0

#### Option 1: Use Shared Development Credentials (Recommended for Teams)

Ask your team lead for the Auth0 credentials and add them to `web/.env.local`:

```env
AUTH0_SECRET=<from_team_lead>
AUTH0_DOMAIN=<from_team_lead>
AUTH0_CLIENT_ID=<from_team_lead>
AUTH0_CLIENT_SECRET=<from_team_lead>
```

#### Option 2: Create Your Own Auth0 Application

1. **Create Auth0 Account:**

   - Go to https://auth0.com
   - Sign up for a free account

2. **Create a New Application:**

   - Go to Applications > Create Application
   - Name: "Bus Ticket Booking"
   - Type: "Regular Web Application"
   - Click Create

3. **Configure Application Settings:**

   - Go to Settings tab
   - Note down: Domain, Client ID, Client Secret

4. **Add Allowed URLs:**

   **Allowed Callback URLs:**

   ```
   http://localhost:3000/auth/callback
   ```

   **Allowed Logout URLs:**

   ```
   http://localhost:3000
   ```

   **Allowed Web Origins:**

   ```
   http://localhost:3000
   ```

5. **Enable Google Connection:**

   - Go to Authentication > Social
   - Enable Google
   - Add your Google OAuth credentials or use Auth0's dev keys

6. **Update `.env.local`:**
   ```env
   AUTH0_DOMAIN=your-tenant.us.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   ```

### OAuth Flow

1. User clicks "Login with Google"
2. Redirects to Auth0 with Google connection
3. User selects Google account and authorizes
4. Auth0 redirects back to application
5. Application syncs user data with backend database
6. Backend generates JWT tokens and sets cookies
7. User is logged in and redirected to dashboard

### Testing Authentication

1. Start both backend and frontend servers
2. Navigate to http://localhost:3000/login
3. Click "Login with Google" button
4. Select your Google account
5. After authorization, you should be redirected to the dashboard
6. Verify cookies in DevTools > Application > Cookies
   - Should see `accessToken` and `refreshToken`

## Database Management

### Prisma Commands

All commands should be run from the `api` directory:

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio (visual database browser)
npm run prisma:studio

# Push schema changes without creating migration (dev only)
npm run db:push

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Seed database with sample data
npm run prisma:seed
```

### Stopping/Removing Database

```bash
# Stop PostgreSQL container
docker compose down

# Stop and remove database volume (deletes all data)
docker compose down -v
```

## Tech Stack

### Backend (API)

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5
- **Database:** PostgreSQL 16
- **ORM:** Prisma 6
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi, express-validator
- **Security:** Helmet, CORS, bcryptjs
- **Email:** Brevo (formerly Sendinblue)

### Frontend (Web)

- **Framework:** Next.js 16
- **Language:** TypeScript 5
- **Authentication:** Auth0 Next.js SDK
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, shadcn/ui
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **State Management:** React Context

### Database

- **PostgreSQL 16** (Alpine)
- Docker containerized
- Managed via Prisma ORM

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Docker** and **Docker Compose** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

Verify installations:

```bash
node --version    # Should be v18 or higher
npm --version
docker --version
docker-compose --version
```

## Development Workflow

### Project Organization

**Backend (api/):**

- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/models/` - Database models (Prisma)
- `src/routes/` - API routes
- `src/middlewares/` - Custom middleware
- `src/utils/` - Helper functions
- `prisma/schema.prisma` - Database schema

**Frontend (web/):**

- `src/app/` - Next.js 16 App Router pages
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and configurations
- `src/contexts/` - React Context providers
- `src/types/` - TypeScript type definitions

### Code Quality

**Backend Linting:**

```bash
cd api
npm run lint
```

**Frontend Linting:**

```bash
cd web
npm run lint
```

## Additional Documentation

For more detailed information about specific features:

**OAuth Setup:** The `docs/AUTH0_OAUTH_SETUP.md` file contains comprehensive documentation about the Auth0 integration, including:

- Complete OAuth flow explanation
- Team collaboration guidelines
- Production deployment steps
- Detailed troubleshooting

**UI Components:** The `docs/UI-design/` folder contains a separate React project with UI component examples and design system.

---

**Last Updated:** 2025-01-26

**Current Versions:**

- Backend API: 1.0.0
- Frontend Web: 0.1.0
- Node.js: 18+
- Next.js: 16.0.3
- Prisma: 6.19.0
- PostgreSQL: 16
