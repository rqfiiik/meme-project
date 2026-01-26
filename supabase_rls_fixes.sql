-- Optimizing RLS Policies to fix performance warnings
-- Run this script in your Supabase SQL Editor

-- ---------------------------------------------------------
-- 1. Fix "auth_rls_initplan" warnings
-- Wrap auth.uid() in (select auth.uid()) to prevent re-evaluation for every row
-- ---------------------------------------------------------

-- Table: public.User
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
CREATE POLICY "Users can update own profile" ON "User"
FOR UPDATE
USING ( id = (select auth.uid())::text );

DROP POLICY IF EXISTS "Users can view own profile" ON "User";
CREATE POLICY "Users can view own profile" ON "User"
FOR SELECT
USING ( id = (select auth.uid())::text );

-- Table: public.Transaction
DROP POLICY IF EXISTS "Users can view own transactions" ON "Transaction";
CREATE POLICY "Users can view own transactions" ON "Transaction"
FOR SELECT
USING ( "userId" = (select auth.uid())::text );

-- Table: public.Wallet
DROP POLICY IF EXISTS "Users can view own wallets" ON "Wallet";
CREATE POLICY "Users can view own wallets" ON "Wallet"
FOR SELECT
USING ( "userId" = (select auth.uid())::text );

-- Table: public.Subscription
DROP POLICY IF EXISTS "Users can view own subscriptions" ON "Subscription";
CREATE POLICY "Users can view own subscriptions" ON "Subscription"
FOR SELECT
USING ( "userId" = (select auth.uid())::text );

-- Table: public.Account
DROP POLICY IF EXISTS "Users can view own accounts" ON "Account";
CREATE POLICY "Users can view own accounts" ON "Account"
FOR SELECT
USING ( "userId" = (select auth.uid())::text );

-- Table: public.Session
DROP POLICY IF EXISTS "Users can view own sessions" ON "Session";
CREATE POLICY "Users can view own sessions" ON "Session"
FOR SELECT
USING ( "userId" = (select auth.uid())::text );

-- ---------------------------------------------------------
-- 2. Fix "multiple_permissive_policies" warnings on BlogPost
-- Combine "Authors can view own posts" and "Public can view published posts"
-- ---------------------------------------------------------

-- Drop existing separate policies
DROP POLICY IF EXISTS "Authors can view own posts" ON "BlogPost";
DROP POLICY IF EXISTS "Public can view published posts" ON "BlogPost";

-- Create combined optimized policy for SELECT
CREATE POLICY "Public view published or Authors view own" ON "BlogPost"
FOR SELECT
USING (
  "published" = true 
  OR 
  "authorId" = (select auth.uid())::text
);
