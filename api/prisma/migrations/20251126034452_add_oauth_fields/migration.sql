/*
  Warnings:

  - A unique constraint covering the columns `[oauthSub]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isOauthUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oauthProvider" TEXT,
ADD COLUMN     "oauthSub" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_oauthSub_key" ON "users"("oauthSub");
