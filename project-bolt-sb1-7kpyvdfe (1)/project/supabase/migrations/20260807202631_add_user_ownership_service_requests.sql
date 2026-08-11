/*
# Add user ownership to service_requests (multi-user with auth)

1. Modified Tables
- `service_requests`
  - Add `user_id` (uuid, NOT NULL, DEFAULT auth.uid()) referencing auth.users with ON DELETE CASCADE.
  - This makes every request owned by the authenticated user who created it.

2. Security Changes
- Replace the old anon-accessible policies with owner-scoped policies (TO authenticated).
- Only the authenticated owner can SELECT, INSERT, UPDATE, DELETE their own requests.
- The frontend insert omits user_id; the DEFAULT auth.uid() fills it from the session.

3. Notes
- The existing rows (if any) have NULL user_id; since the column is NOT NULL we add it
  with a default and backfill existing rows with a placeholder via a DO block using
  gen_random_uuid() is not valid for FK, so we instead add the column nullable first,
  then set NOT NULL after. Existing rows from the no-auth era will be deleted since
  they have no valid owner.
*/

-- Add user_id column (nullable first to avoid NOT NULL violation on existing rows)
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Delete any pre-existing rows that have no owner (from the no-auth era)
DELETE FROM service_requests WHERE user_id IS NULL;

-- Now make it NOT NULL with the auth.uid() default
ALTER TABLE service_requests ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE service_requests ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Drop old anon policies
DROP POLICY IF EXISTS "anon_select_service_requests" ON service_requests;
DROP POLICY IF EXISTS "anon_insert_service_requests" ON service_requests;
DROP POLICY IF EXISTS "anon_update_service_requests" ON service_requests;
DROP POLICY IF EXISTS "anon_delete_service_requests" ON service_requests;

-- Create owner-scoped policies (authenticated only)
DROP POLICY IF EXISTS "select_own_service_requests" ON service_requests;
CREATE POLICY "select_own_service_requests" ON service_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_service_requests" ON service_requests;
CREATE POLICY "insert_own_service_requests" ON service_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_service_requests" ON service_requests;
CREATE POLICY "update_own_service_requests" ON service_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_service_requests" ON service_requests;
CREATE POLICY "delete_own_service_requests" ON service_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
