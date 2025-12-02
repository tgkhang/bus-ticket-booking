/*
  Migration to add camelCase support with @map directives
  - Add created_at and updated_at timestamps to buses and operators tables
  - Add status field to buses table
*/

-- AlterTable (Add new columns to buses table)
ALTER TABLE "buses"
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable (Add new columns to operators table)
ALTER TABLE "operators"
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
