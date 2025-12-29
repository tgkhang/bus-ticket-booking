-- AlterTable
ALTER TABLE "users" ADD COLUMN "operator_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_operator_id_key" ON "users"("operator_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
