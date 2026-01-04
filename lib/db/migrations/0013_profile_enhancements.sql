-- Migration: Add new profile fields for comprehensive health tracking
-- Date: 2026-01-03

-- Sleep & Rest enhancements
ALTER TABLE "medical_profiles" ADD COLUMN "nap_time" integer; -- minutes

-- Stress & Mental Wellbeing
ALTER TABLE "medical_profiles" ADD COLUMN "morning_sunlight_exposure" varchar(10); -- 'yes' or 'no'

-- Exercise Activities (new structure to support multiple activities with individual settings)
ALTER TABLE "medical_profiles" ADD COLUMN "exercise_activities" json;

-- Functional Tests (new biomarkers)
ALTER TABLE "medical_profiles" ADD COLUMN "co2_tolerance_test" real; -- seconds
ALTER TABLE "medical_profiles" ADD COLUMN "vo2_max" real; -- ml/kg/min
ALTER TABLE "medical_profiles" ADD COLUMN "body_fat_percentage" real; -- % (for FFMI calculation)

-- Nutrition
ALTER TABLE "medical_profiles" ADD COLUMN "supplementation" text;

-- Note: Old exercise fields (exercise_types, exercise_frequency, exercise_duration, exercise_intensity)
-- are kept for backward compatibility. Frontend should migrate data to exercise_activities.
