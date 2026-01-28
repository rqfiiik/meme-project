-- Optimizing RLS Policies based on Supabase Linter Warnings

-- 1. Fix auth_rls_initplan (Performance) for AdminLog
-- Replace auth.uid() with (select auth.uid()) to prevent per-row re-evaluation
DROP POLICY IF EXISTS "Admins can insert logs" ON "public"."AdminLog";
CREATE POLICY "Admins can insert logs"
ON "public"."AdminLog"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."User" 
    WHERE "User"."id" = (select auth.uid()::text) 
    AND "User"."role" = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view logs" ON "public"."AdminLog";
CREATE POLICY "Admins can view logs"
ON "public"."AdminLog"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."User" 
    WHERE "User"."id" = (select auth.uid()::text) 
    AND "User"."role" = 'admin'
  )
);

-- 2. Fix auth_rls_initplan for AffiliateEarning
-- "Creators can view own earnings"
DROP POLICY IF EXISTS "Creators can view own earnings" ON "public"."AffiliateEarning";
CREATE POLICY "Creators can view own earnings"
ON "public"."AffiliateEarning"
FOR SELECT
TO authenticated
USING (
  "creatorId" = (select auth.uid()::text)
);

-- 3. Fix multiple_permissive_policies for AdminLog
-- The warning "Table public.AdminLog has multiple permissive policies" suggests you have policies like:
-- "Admins can insert logs" AND "No public access to AdminLogs".
-- In Postgres RLS, policies are OR-ed together (Permissive). 
-- "No public access" policies are typically generic DENY, but RLS denies by default if no policy matches.
-- If you have a policy that literally says "USING (false)", it doesn't block other permissive policies.
-- To fix this warning, you should DROP the redundant "No public access..." policies if you rely on the Admin ones.

DROP POLICY IF EXISTS "No public access to AdminLogs" ON "public"."AdminLog";
-- We rely on "Admins can insert/view logs" to grant access. 
-- If no policy matches (e.g. non-admin), access is denied by default.

-- Verify policies
-- SELECT * FROM pg_policies WHERE tablename = 'AdminLog';
