-- Optimizing RLS Policies for Performance
-- Wraps auth.uid() in (select auth.uid()) to prevent re-evaluation for each row.

-- 1. AdminLog Policies
DROP POLICY IF EXISTS "Admins can insert logs" ON "AdminLog";
CREATE POLICY "Admins can insert logs"
ON "AdminLog"
FOR INSERT
WITH CHECK ((select auth.uid())::text = "adminId");

DROP POLICY IF EXISTS "Admins can view logs" ON "AdminLog";
CREATE POLICY "Admins can view logs"
ON "AdminLog"
FOR SELECT
USING ((select auth.uid())::text = "adminId");

-- 2. AffiliateEarning Policies
DROP POLICY IF EXISTS "Creators can view own earnings" ON "AffiliateEarning";
CREATE POLICY "Creators can view own earnings"
ON "AffiliateEarning"
FOR SELECT
USING ((select auth.uid())::text = "creatorId");
