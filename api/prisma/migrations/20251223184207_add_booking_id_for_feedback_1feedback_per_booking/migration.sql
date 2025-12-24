/*
  Warnings:

  - A unique constraint covering the columns `[booking_id]` on the table `feedbacks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `booking_id` to the `feedbacks` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "feedbacks_trip_id_user_id_key";

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "booking_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_booking_id_key" ON "feedbacks"("booking_id");

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
