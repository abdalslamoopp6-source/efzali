/*
# Add chat messages and provider name

1. Modified Tables
- `service_requests`: add `provider_name` (text, nullable) — stores the name of the provider who accepted the request, so the customer can see who is handling their request.

2. New Tables
- `chat_messages`
  - `id` (uuid, primary key)
  - `request_id` (uuid, foreign key → service_requests.id ON DELETE CASCADE)
  - `sender_type` (text: 'customer' | 'provider')
  - `sender_name` (text, not null)
  - `message` (text, not null)
  - `created_at` (timestamptz, default now())

3. Security
- Enable RLS on `chat_messages`.
- Allow anon + authenticated CRUD (same shared-data model as `service_requests` — this is a no-auth app).

4. Indexes
- Index on `request_id` for fast message lookups per request.
- Index on `created_at` for chronological ordering.
*/

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS provider_name text;

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'provider')),
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_request_id ON chat_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);
