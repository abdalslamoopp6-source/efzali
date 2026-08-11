/*
# Create service_requests table (single-tenant, no auth)

1. New Tables
- `service_requests`
  - `id` (uuid, primary key)
  - `service_key` (text, not null) - identifies which service was requested (e.g. "battery", "tire", "fuel")
  - `service_name` (text, not null) - Arabic display name of the service
  - `customer_name` (text, not null) - name of the person requesting the service
  - `phone` (text, not null) - contact phone number
  - `location` (text, not null) - location/address where service is needed
  - `notes` (text, nullable) - optional additional notes
  - `status` (text, not null default 'pending') - request status
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `service_requests`.
- Allow anon + authenticated full CRUD because this is a no-auth single-tenant app where requests are intentionally public/shared.
*/

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text NOT NULL,
  service_name text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_service_requests" ON service_requests;
CREATE POLICY "anon_select_service_requests" ON service_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_service_requests" ON service_requests;
CREATE POLICY "anon_insert_service_requests" ON service_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_service_requests" ON service_requests;
CREATE POLICY "anon_update_service_requests" ON service_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_service_requests" ON service_requests;
CREATE POLICY "anon_delete_service_requests" ON service_requests FOR DELETE
  TO anon, authenticated USING (true);
