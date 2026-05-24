-- Add timezone column to agency_settings if it doesn't exist
-- Run this if migration 014 was applied before the timezone column was added
ALTER TABLE agency_settings
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Caracas';
