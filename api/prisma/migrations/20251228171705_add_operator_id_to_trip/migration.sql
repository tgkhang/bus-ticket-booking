/*
  Warnings:

  - Added the required column `operator_id` to the `trips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add operator_id column as nullable first
ALTER TABLE "trips" ADD COLUMN "operator_id" TEXT;

-- Populate operator_id from the route's operator
UPDATE "trips"
SET "operator_id" = (
  SELECT "routes"."operator_id"
  FROM "routes"
  WHERE "routes"."id" = "trips"."route_id"
);

-- Make operator_id NOT NULL after populating data
ALTER TABLE "trips" ALTER COLUMN "operator_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "trips_operator_id_idx" ON "trips"("operator_id");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
