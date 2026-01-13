-- Add new sleep fields
ALTER TABLE "medical_profiles" ADD COLUMN "time_in_bed" real;
ALTER TABLE "medical_profiles" ADD COLUMN "sleep_regularity" integer;
ALTER TABLE "medical_profiles" ADD COLUMN "first_sunlight_exposure_time" varchar(5);
ALTER TABLE "medical_profiles" ADD COLUMN "last_meal_time" varchar(5);
ALTER TABLE "medical_profiles" ADD COLUMN "artificial_light_exposure_time" varchar(5);

-- Drop old fields
ALTER TABLE "medical_profiles" DROP COLUMN "nap_time";
ALTER TABLE "medical_profiles" DROP COLUMN "morning_sunlight_exposure";
