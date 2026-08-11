/*
# Update service_requests for GPS-based location

1. Modified Tables
- `service_requests`
  - Make `phone` nullable (name-only requests, no phone required)
  - Add `latitude` (double precision, nullable) - GPS latitude
  - Add `longitude` (double precision, nullable) - GPS longitude

2. Notes
- Phone is no longer required since requests are name-only with auto GPS location.
- Latitude/longitude store the auto-detected GPS coordinates.
*/

ALTER TABLE service_requests ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE service_requests ALTER COLUMN location DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'latitude') THEN
    ALTER TABLE service_requests ADD COLUMN latitude double precision;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'longitude') THEN
    ALTER TABLE service_requests ADD COLUMN longitude double precision;
  END IF;
END $$;
