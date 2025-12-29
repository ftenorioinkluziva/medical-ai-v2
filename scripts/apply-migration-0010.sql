-- Migration 0010: Add allowed_authors and allowed_subcategories to health_agents
-- Run this script directly in your database if the standard migration fails

-- Add the new columns (they will be ignored if they already exist)
DO $$
BEGIN
    -- Add allowed_authors column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'health_agents'
        AND column_name = 'allowed_authors'
    ) THEN
        ALTER TABLE "health_agents" ADD COLUMN "allowed_authors" json DEFAULT '[]'::json;
        RAISE NOTICE 'Column allowed_authors added successfully';
    ELSE
        RAISE NOTICE 'Column allowed_authors already exists, skipping';
    END IF;

    -- Add allowed_subcategories column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'health_agents'
        AND column_name = 'allowed_subcategories'
    ) THEN
        ALTER TABLE "health_agents" ADD COLUMN "allowed_subcategories" json DEFAULT '[]'::json;
        RAISE NOTICE 'Column allowed_subcategories added successfully';
    ELSE
        RAISE NOTICE 'Column allowed_subcategories already exists, skipping';
    END IF;
END $$;

-- Verify the columns were added
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'health_agents'
    AND column_name IN ('allowed_authors', 'allowed_subcategories')
ORDER BY column_name;
