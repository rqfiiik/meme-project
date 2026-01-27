-- 1. Add Creator fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "isCreator" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "promoCode" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "referrerId" TEXT REFERENCES "User"("id"),
ADD COLUMN IF NOT EXISTS "commissionRate" DOUBLE PRECISION DEFAULT 0.5;

-- 2. Create AffiliateEarning table
CREATE TABLE IF NOT EXISTS "AffiliateEarning" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "creatorId" TEXT NOT NULL REFERENCES "User"("id"),
    "referredUserId" TEXT NOT NULL REFERENCES "User"("id"),
    "transactionId" TEXT NOT NULL REFERENCES "Transaction"("id"), -- Assuming Transaction ID is TEXT
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enable RLS on new table
ALTER TABLE "AffiliateEarning" ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Optional if using mostly service role, but good practice)
-- Creators can view their own earnings
CREATE POLICY "Creators can view own earnings" ON "AffiliateEarning"
FOR SELECT
USING (auth.uid()::text = "creatorId");

-- Admins can view all (assuming admin logic, or just service role bypasses)
