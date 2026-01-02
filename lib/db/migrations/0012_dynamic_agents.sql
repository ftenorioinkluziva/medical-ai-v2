-- Migration: Make health agents dynamic (remove hardcoded agent columns)
-- Replace individual agent ID columns with dynamic array

-- Add new analysis_ids column
ALTER TABLE "complete_analyses" ADD COLUMN "analysis_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Migrate existing data from old columns to new array
UPDATE "complete_analyses"
SET "analysis_ids" =
  COALESCE(
    (
      SELECT jsonb_agg(id)
      FROM (
        SELECT "integrative_analysis_id" as id WHERE "integrative_analysis_id" IS NOT NULL
        UNION ALL
        SELECT "nutrition_analysis_id" as id WHERE "nutrition_analysis_id" IS NOT NULL
        UNION ALL
        SELECT "exercise_analysis_id" as id WHERE "exercise_analysis_id" IS NOT NULL
      ) ids
    ),
    '[]'::jsonb
  )
WHERE "integrative_analysis_id" IS NOT NULL
   OR "nutrition_analysis_id" IS NOT NULL
   OR "exercise_analysis_id" IS NOT NULL;

-- Drop old columns
ALTER TABLE "complete_analyses" DROP COLUMN IF EXISTS "integrative_analysis_id";
ALTER TABLE "complete_analyses" DROP COLUMN IF EXISTS "nutrition_analysis_id";
ALTER TABLE "complete_analyses" DROP COLUMN IF EXISTS "exercise_analysis_id";
