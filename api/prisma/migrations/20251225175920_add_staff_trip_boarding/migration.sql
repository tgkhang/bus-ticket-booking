-- AlterTable
ALTER TABLE "passenger_details" ADD COLUMN     "boarded_at" TIMESTAMP(3),
ADD COLUMN     "is_boarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "actual_arrival" TIMESTAMP(3),
ADD COLUMN     "actual_departure" TIMESTAMP(3),
ADD COLUMN     "staff_id" TEXT;

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "operator_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE INDEX "trips_staff_id_idx" ON "trips"("staff_id");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
