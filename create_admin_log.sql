-- Create AdminLog table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AdminLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE "AdminLog" ENABLE ROW LEVEL SECURITY;

-- Allow Insert for Authenticated Users (Admins)
create policy "Admins can insert logs"
  on "AdminLog"
  for insert
  with check (auth.uid()::text = "adminId");

-- Allow Select for Admins (View their own logs or all logs if super admin logic applied)
-- For now, allow viewing log if you are the creator
create policy "Admins can view logs"
  on "AdminLog"
  for select
  using (auth.uid()::text = "adminId");

-- Allow Service Role full access (Implicit in Supabase but good to be explicit for some setups)
-- (No specific policy needed for service_role as it bypasses RLS)
