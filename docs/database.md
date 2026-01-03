# Database Folder Report

## Overview

The `api/prisma/` folder contains the entire structure and data of the PostgreSQL database for the bus ticket booking system. It uses Prisma ORM to manage schema, migrations, and seeding data.

## Directory Structure

```
api/prisma/
├── schema.prisma          # Main schema defining database structure
├── seed.js                # Script for seeding sample data
├── search_indexes.sql     # SQL queries for search indexes
└── migrations/            # Folder containing migration files
    ├── migration_lock.toml
    └── [timestamp]_[description]/
        └── migration.sql
```

## Database Schema

### Schema Overview
- **Provider**: PostgreSQL
- **ORM**: Prisma Client
- **Total Models**: 18 models
- **Total Migrations**: 17 migrations
- **Language**: TypeScript/JavaScript

### Main Models

#### 1. User Management & Authentication
- **User**: Manages users with 4 roles:
  - **client**: Regular users who book tickets
  - **admin**: System administrators who manage all users, operators, routes
  - **operator**: Bus company owners who manage routes, buses, trips of their company
  - **staff**: Bus company employees who manage specific assigned trips
- **Operator**: Separate model for bus company information (company entity)
  - Stores company info, contact, status (pending/approved/suspended)
  - Users with "operator" role are linked to Operator via `operatorId`
  - One Operator can have multiple users (operator + staff)
- **Staff**: Links employees with operators, manages assigned trips
- **RefreshToken**: Manages JWT refresh tokens with family rotation
- **PaymentMethod**: User's payment methods

**Distinction**:
- `User.role = "operator"` is a user account managing a bus company
- `Operator` model is the business/company information of the bus company
- One Operator (company) can have multiple Users with operator/staff roles

#### 2. Transportation & Routes
- **Stop**: Bus stops with GPS coordinates
  - Imported from real HCM City data (`hcmc_stops.txt`)
  - Supports full-text search
- **Route**: Routes with origin, destination, ticket price
  - Belongs to a specific Operator
- **RouteStop**: Order of intermediate stops on a route
  - Defines detailed route itinerary

#### 3. Fleet Management
- **Bus**: Buses with information:
  - License plate, bus type (limousine, sleeper, seater)
  - Bus images (busImages)
  - Belongs to an Operator
- **Seat**: Seats on the bus with layout (row, column, floor)
  - Supports 2-floor buses

#### 4. Trip & Booking System
- **Trip**: Specific trips
  - Links Route, Bus, Operator
  - Departure time, status (scheduled/ongoing/completed/cancelled)
  - Managed by Staff
- **SeatStatus**: Seat status for each trip
  - available, booked, locked (temporary hold during booking)
  - System automatically unlocks after timeout
- **Booking**: Ticket bookings
  - Supports both logged-in clients and guest bookings
  - Links with Payment, PassengerDetail, Feedback
- **Payment**: Payment for booking
  - Methods: cash, card, banking, e-wallet
  - Status tracking
- **PassengerDetail**: Detailed passenger information
  - Supports multiple passengers in one booking

#### 5. Communication & Feedback
- **Notification**: Notifications for users
  - Linked with payment method
- **Feedback**: Trip reviews
  - Each booking has only 1 feedback
  - Rating 1-5 stars

### Key Relationships
- **User ↔ Operator**: User (operator/staff role) belongs to an Operator (n-1)
- **Operator ↔ Route/Bus/Trip**: Operator owns multiple routes, buses, trips (1-n)
- **Route ↔ RouteStop ↔ Stop**: Route has multiple intermediate stops (1-n-1)
- **Trip ↔ SeatStatus**: Each trip has multiple seat statuses (1-n)
- **Booking ↔ Payment**: Each booking has one payment (1-1)
- **Booking ↔ Feedback**: Each booking has at most one feedback (1-1)

## Migration System

### How It Works
Prisma migrations allow:
- Creating database schema from code
- Tracking schema changes over time
- Synchronizing schema between development and production
- Rollback when necessary

### Basic Commands

#### Development Environment
```bash
# Create new migration
npx prisma migrate dev --name "add_new_feature"

# Apply migration
npx prisma migrate dev

# Reset database (delete all data and re-run migrations)
npx prisma migrate reset
```

#### Production Environment
```bash
# Apply migrations to production database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Migration Files
Each migration contains:
- **migration.sql**: SQL commands to change schema
- **Checksum**: Ensures migration is not changed
- **Timestamp**: Execution order

### Migration History
```
20251120024631_setup_db/                    # Basic database setup
20251125062208_update_user_and_complete_schema/  # Complete user schema
20251126034452_add_oauth_fields/            # Add OAuth fields for Auth0
20251128102621_setup_stop_route_route_stop/ # Setup stops and routes
20251130163742_add_db_indexing_for_trip/    # Add indexes for performance
20251202035015_camelcase_schema_update/     # Switch to camelCase naming
20251202040440_standardize_to_camelcase/    # Standardize naming convention
20251218082549_add_user_contact_and_financial_fields/ # Contact + financial info
20251220150947_add_bus_type_field/          # Add bus type (limousine/sleeper/seater)
20251221165213_add_bus_images/              # Add bus images
20251223184207_add_booking_id_for_feedback_1feedback_per_booking/ # 1 feedback/booking
20251225175920_add_staff_trip_boarding/     # Staff manage trips
20251228171705_add_operator_id_to_trip/     # Link trips with operators
20251230002125_add_operator_id_to_users/    # Link users with operators
20251230090000_add_fulltext_search/         # Full-text search for stops/routes
20251230120000_add_guest_booking_fields/    # Support guest booking
20260102101956_remove_operator_id_unique_constraint/ # Fix operator constraints
```

## Seeding Data

### File seed.js
Seeding script creates sample data for development and testing:

#### Users Seeded
- **1 Admin**: admin@busticket.vn (system administrator)
- **2 Operators**: operator1@greenbus.com, operator2@expresstravel.vn
- **6+ Clients**: Regular users for testing bookings
- **Staff**: Employees linked with operators

#### Business Data
- **Operators**:
  - Green Bus Lines (approved)
  - Express Travel Co. (approved)
- **Stops**: Imported from file `data/hcmc_stops.txt`
  - 10+ real stops in HCM City
  - Accurate GPS coordinates
- **Routes**: Intra-city routes
  - Each route belongs to an operator
  - Has price, duration, stops
- **Buses**: Buses of different types
  - Limousine, Sleeper, Seater
  - Each bus has seat layout
- **Trips**: Sample trips for testing
- **Bookings**: Sample bookings with different statuses

### Import Stops Data
```javascript
// Read hcmc_stops.txt file (CSV format)
const stopsFile = path.resolve(__dirname, '../../data/hcmc_stops.txt')
const raw = fs.readFileSync(stopsFile, 'utf8')
const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)

// Parse CSV: stop_id,stop_code,stop_name,stop_lat,stop_lon
for (const line of dataLines) {
  const parts = line.split(',')
  const name = parts[2]?.trim()
  const lat = parseFloat(parts[3])
  const lon = parseFloat(parts[4])
  // Create stop with upsert to avoid duplicates
  await ensureStop(name, lat, lon, '')
}
```

### Running Seeding
```bash
# Development
npx prisma db seed

# Reset and seed from scratch
npx prisma migrate reset

# Seed separately (migrations already exist)
npm run prisma:seed
```

## Search Indexes

### File search_indexes.sql
Contains SQL queries to create full-text search indexes:
- **GIN indexes** for text search on PostgreSQL
- **Performance optimization** for search queries
- Supports Vietnamese search with diacritics

### Example Index
```sql
-- Full-text search for stops
CREATE INDEX idx_stops_search ON stops
USING gin(to_tsvector('english', name || ' ' || COALESCE(address, '')));

-- Search for routes
CREATE INDEX idx_routes_search ON routes
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Spatial indexes for GPS coordinates
CREATE INDEX idx_stops_location ON stops (latitude, longitude);
```

## Migration Guide

### 1. Development Workflow

#### Create New Migration
```bash
# Step 1: Change schema.prisma
# Example: Add new field to User model
model User {
  // ... existing fields
  newField String?
}

# Step 2: Create migration
npx prisma migrate dev --name "add_new_field_to_user"

# Migration file will be created in prisma/migrations/[timestamp]_add_new_field_to_user/
```

#### Test Migration
```bash
# Reset database and apply all migrations
npx prisma migrate reset

# Check schema with Prisma Studio
npx prisma studio
```

### 2. Production Deployment

#### Preparation
```bash
# Ensure code is committed
git add .
git commit -m "Add new feature"

# Push to repository
git push origin main
```

#### On Production Server (Render)

**Note**: On Render, migrations run automatically in build command.

**Method 1: Automatic**
```bash
# Build command on Render already includes:
npm install && npx prisma generate && npx prisma migrate deploy
```

**Method 2: Manual (Local with production DB)**
```bash
# Connect to production database
# Add Render DATABASE_URL to local .env

# Run migration
cd api
npx prisma migrate deploy

# Seed data (only first time)
npx prisma db seed
```

### 3. Troubleshooting

#### Migration Fails
```bash
# Check connection string
echo $DATABASE_URL

# Reset if needed (development only - DELETES DATA)
npx prisma migrate reset
```

#### Schema Conflicts
```bash
# View migration status
npx prisma migrate status

# Resolve conflicts manually
npx prisma migrate resolve --applied [migration_name]

# Or mark as rolled back
npx prisma migrate resolve --rolled-back [migration_name]
```

#### Rollback Migration
```bash
# Prisma does not support automatic rollback
# Must create new migration to undo changes

# Example: Undo adding field
npx prisma migrate dev --name "remove_new_field_from_user"

# In migration.sql, write SQL to drop field:
# ALTER TABLE "users" DROP COLUMN "new_field";
```

#### Database Out of Sync
```bash
# Pull schema from database
npx prisma db pull

# Compare with schema.prisma
# Resolve conflicts manually

# Push schema to database (development only)
npx prisma db push
```

## Best Practices

### Schema Design
- ✅ Use camelCase for field names in Prisma
- ✅ Add `@map()` for snake_case database columns
- ✅ Use UUID for primary keys (good for distributed systems)
- ✅ Add indexes for foreign keys and frequently queried fields
- ✅ Use `@@index()` for composite indexes
- ✅ Add `@default()` for fields with default values
- ❌ Do not hardcode values, use enums or constants

### Migration Strategy
- ✅ Create migration for **every** schema change
- ✅ Test migrations locally before deploying
- ✅ **Never** modify applied migration files
- ✅ Use descriptive names for migrations
- ✅ Review migration SQL before committing
- ✅ Backup database before running large migrations
- ❌ Do not delete applied migrations on production

### Data Seeding
- ✅ Create sufficient data for development and testing
- ✅ Use `upsert()` to avoid duplicate data
- ✅ Import real data when possible (like HCMC stops)
- ✅ Create relationships in correct order (parent before child)
- ✅ Hash passwords with bcrypt
- ✅ Use realistic data for testing
- ❌ Do not seed sensitive data on production

### Performance
- ✅ Add indexes for foreign keys
- ✅ Use full-text search indexes for text fields
- ✅ Optimize queries with `select` specific fields
- ✅ Use `include` instead of multiple queries
- ✅ Monitor slow queries with Prisma logging
- ✅ Use pagination for large datasets
- ❌ Avoid N+1 query problem

## Database Tools

### Prisma Studio
```bash
npx prisma studio
```
- **GUI** to view and edit data visually
- **Debug relationships** easily
- **Test queries** in real-time
- **Port**: http://localhost:5555

### Database Inspection
```bash
# Show current schema from database
npx prisma db pull

# Push schema to database (development only, skip migrations)
npx prisma db push

# Execute raw SQL file
npx prisma db execute --file script.sql

# Execute raw SQL command
npx prisma db execute --stdin <<< "SELECT * FROM users LIMIT 5"
```

### Prisma Client Debug
```javascript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Log specific query
const users = await prisma.user.findMany()
// Will log SQL query to console
```

## Backup & Recovery

### Automatic Backup (Render PostgreSQL)
- **Free tier**: 7 days retention
- **Paid plans**: 30+ days retention
- **Point-in-time recovery**: Available on paid plans
- **Automatic daily backups**

### Manual Backup
```bash
# Backup database to SQL file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20260103.sql

# Backup schema only
npx prisma db pull
# Schema saved in schema.prisma
```

### Export Data
```bash
# Export specific table
npx prisma db execute --stdin <<< "COPY users TO STDOUT WITH CSV HEADER" > users.csv

# Export all data
pg_dump $DATABASE_URL --data-only > data_backup.sql
```

## Monitoring

### Database Metrics
- **Connection count**: Monitor active connections
- **Query performance**: Track slow queries
- **Table sizes**: Monitor database growth
- **Index usage**: Ensure indexes are used

### Prisma Metrics
```javascript
// Enable query metrics
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})
```

### Performance Monitoring
- **Render Dashboard**: View database metrics
- **Slow Query Log**: Enable on PostgreSQL
- **Connection Pool**: Monitor pool usage

## Common Issues & Solutions

### Issue: Migration Out of Sync
**Problem**: Schema.prisma differs from actual database
```bash
# Solution
npx prisma migrate status
npx prisma db pull
# Compare and resolve manually
npx prisma migrate deploy
```

### Issue: Connection Timeout
**Problem**: Cannot connect to database
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin <<< "SELECT 1"

# Check firewall/network
```