-- Add guest booking support

-- 1) Allow bookings without a registered user
ALTER TABLE "bookings"
  ALTER COLUMN "user_id" DROP NOT NULL;

-- 2) Guest contact fields (used when user_id IS NULL)
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "guest_email" TEXT,
  ADD COLUMN IF NOT EXISTS "guest_phone" TEXT,
  ADD COLUMN IF NOT EXISTS "guest_name" TEXT;

-- 3) Guest access fields (for secure lookup)
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "reference_code" TEXT,
  ADD COLUMN IF NOT EXISTS "access_token_hash" TEXT;

-- Unique reference code for lookups (NULLs allowed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_indexes
    WHERE  schemaname = 'public'
    AND    indexname = 'bookings_reference_code_key'
  ) THEN
    CREATE UNIQUE INDEX "bookings_reference_code_key" ON "bookings"("reference_code");
  END IF;
END $$;
