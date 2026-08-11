/*
# Switch to name-only (no auth) mode

1. Modified Tables
- `service_requests`
  - Make `user_id` nullable (no auth session for anon users)
  - Drop the DEFAULT auth.uid() (anon users have no auth.uid())

2. Security Changes
- Replace owner-scoped policies (TO authenticated) with anon-accessible policies (TO anon, authenticated)
- All rows are accessible since there's no real auth - just a name stored locally.
*/

-- Make user_id nullable
ALTER TABLE service_requests ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE service_requests ALTER COLUMN user_id DROP DEFAULT;

-- Drop owner-scoped policies
DROP POLICY IF EXISTS "select_own_service_requests" ON service_requests;
DROP POLICY IF EXISTS "insert_own_service_requests" ON service_requests;
DROP POLICY IF EXISTS "update_own_service_requests" ON service_requests;
DROP POLICY IF EXISTS "delete_own_service_requests" ON service_requests;

-- Create anon-accessible policies
CREATE POLICY "anon_select_service_requests" ON service_requests FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_service_requests" ON service_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_service_requests" ON service_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_service_requests" ON service_requests FOR DELETE
  TO anon, authenticated USING (true);
