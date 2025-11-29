# Database Migration Guide

This guide explains how to migrate your database to the new version after pulling the latest changes.

## Migration Steps

### Option 1: Automatic Migration (Recommended)

If you have Prisma set up and your database is empty or you can reset it:

```bash
cd api

# Generate Prisma Client
npm run prisma:generate

# Run all pending migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

### Option 2: Apply Migration to Existing Database

If you have existing data in the `routes` table:

```bash
cd api

# 1. Generate Prisma Client
npm run prisma:generate

# 2. Deploy migrations (this will run the migration SQL)
npx prisma migrate deploy
```

**WARNING**: This migration will fail if your `routes` table contains data, because:

- It tries to add `originStopId`, `destinationStopId`, and `name` columns that are NOT NULL
- Existing rows won't have values for these columns

### Option 3: Manual Migration with Data Preservation

If you need to preserve existing route data:

1. **Backup your database first!**

```bash
pg_dump -U your_username your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Create a custom migration script** to:
   - Create the `stops` table
   - Migrate existing route origin/destination text to stop records
   - Update routes to reference the new stops
   - Apply the remaining changes

Example manual migration:

```sql
-- 1. Create stops table
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- 2. Add temporary columns to routes
ALTER TABLE "routes"
    ADD COLUMN "originStopId_temp" TEXT,
    ADD COLUMN "destinationStopId_temp" TEXT,
    ADD COLUMN "name_temp" TEXT;

-- 3. Migrate data: Create stops from existing origin/destination
-- (This is a simplified example - adjust based on your data)
INSERT INTO "stops" ("id", "name", "latitude", "longitude", "updatedAt")
SELECT
    gen_random_uuid(),
    origin,
    0.0, -- You'll need to provide real coordinates
    0.0,
    NOW()
FROM "routes"
WHERE origin IS NOT NULL
GROUP BY origin;

-- Repeat for destinations
INSERT INTO "stops" ("id", "name", "latitude", "longitude", "updatedAt")
SELECT
    gen_random_uuid(),
    destination,
    0.0,
    0.0,
    NOW()
FROM "routes"
WHERE destination IS NOT NULL
    AND destination NOT IN (SELECT name FROM stops)
GROUP BY destination;

-- 4. Update routes to reference stops
UPDATE "routes" r
SET
    "originStopId_temp" = s.id,
    "name_temp" = CONCAT(r.origin, ' → ', r.destination)
FROM "stops" s
WHERE r.origin = s.name;

UPDATE "routes" r
SET "destinationStopId_temp" = s.id
FROM "stops" s
WHERE r.destination = s.name;

-- 5. Now apply the actual migration
ALTER TABLE "routes"
    DROP COLUMN "destination",
    DROP COLUMN "origin",
    ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "destinationStopId" TEXT NOT NULL,
    ADD COLUMN "name" TEXT NOT NULL,
    ADD COLUMN "originStopId" TEXT NOT NULL,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN "distance_km" DROP NOT NULL,
    ALTER COLUMN "distance_km" SET DATA TYPE DOUBLE PRECISION,
    ALTER COLUMN "estimated_minutes" DROP NOT NULL;

-- 6. Copy temp data to real columns
UPDATE "routes"
SET
    "originStopId" = "originStopId_temp",
    "destinationStopId" = "destinationStopId_temp",
    "name" = "name_temp";

-- 7. Drop temp columns
ALTER TABLE "routes"
    DROP COLUMN "originStopId_temp",
    DROP COLUMN "destinationStopId_temp",
    DROP COLUMN "name_temp";

-- 8. Create remaining tables and indexes
-- (See the full migration file for complete SQL)
```

### Option 4: Fresh Start (Development Only)

If you're in development and don't need existing data:

```bash
cd api

# Reset database (WARNING: Deletes all data!)
npm run prisma:reset

# This will:
# - Drop all tables
# - Run all migrations
# - Run seed script
```

## Verification

After migration, verify the schema:

```bash
cd api
npm run prisma:studio
```

Check that:

1. `stops` table exists with sample data
2. `routes` table has the new columns
3. `route_stops` table exists
4. Foreign key relationships are working

## Rollback

If you need to rollback:

```bash
# Restore from backup
psql -U your_username your_database < backup_file.sql

# Or manually drop the migration
npx prisma migrate resolve --rolled-back 20251128102621_setup_stop_route_route_stop
```

## Common Issues

### Issue: Migration fails with "column does not allow null values"

**Solution**: Your routes table has existing data. Use Option 3 (Manual Migration) or Option 4 (Fresh Start).

### Issue: Foreign key constraint violation

**Solution**: Ensure all `originStopId` and `destinationStopId` values reference existing stops.

### Issue: Prisma Client out of sync

**Solution**: Run `npm run prisma:generate` to regenerate the client.

## Next Steps

After successful migration:

1. Update your seed script if needed: [prisma/seed.js](../../api/prisma/seed.js)
2. Test the new Routes & Stops API endpoints
3. Review the API documentation: [ROUTES_STOPS.md](../ROUTES_STOPS.md)
4. Check the OpenAPI spec: [api/openapi.yaml](../../api/openapi.yaml)

## Useful Commands

```bash
# Check migration status
npx prisma migrate status

# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy
```
