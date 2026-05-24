-- Allow all authenticated users to read agency_settings
-- (contact info, timezone, WhatsApp — non-sensitive, needed for client-facing features)
DROP POLICY IF EXISTS "admin_select" ON agency_settings;

CREATE POLICY "authenticated_select" ON agency_settings
  FOR SELECT TO authenticated
  USING (true);

-- Re-create admin_update policy in case it was affected
-- (no change needed — it was only a SELECT policy we dropped)
