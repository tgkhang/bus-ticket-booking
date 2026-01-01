-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'VND',
ADD COLUMN     "phone_number" TEXT;
