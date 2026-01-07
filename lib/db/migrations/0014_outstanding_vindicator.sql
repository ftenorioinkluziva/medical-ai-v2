ALTER TABLE "complete_analyses" DROP CONSTRAINT "complete_analyses_integrative_analysis_id_analyses_id_fk";
--> statement-breakpoint
ALTER TABLE "complete_analyses" DROP CONSTRAINT "complete_analyses_nutrition_analysis_id_analyses_id_fk";
--> statement-breakpoint
ALTER TABLE "complete_analyses" DROP CONSTRAINT "complete_analyses_exercise_analysis_id_analyses_id_fk";
--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "nap_time" integer;--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "morning_sunlight_exposure" varchar(10);--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "exercise_activities" json;--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "co2_tolerance_test" real;--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "vo2_max" real;--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "body_fat_percentage" real;--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "supplementation" text;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "agent_type" varchar(50) DEFAULT 'analysis' NOT NULL;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "product_type" varchar(50) DEFAULT null;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "generator_key" varchar(100);--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "output_schema" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "rag_config" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "execution_order" integer DEFAULT null;--> statement-breakpoint
ALTER TABLE "complete_analyses" ADD COLUMN "analysis_ids" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "medical_profiles" DROP COLUMN "exercise_types";--> statement-breakpoint
ALTER TABLE "medical_profiles" DROP COLUMN "exercise_frequency";--> statement-breakpoint
ALTER TABLE "medical_profiles" DROP COLUMN "exercise_duration";--> statement-breakpoint
ALTER TABLE "medical_profiles" DROP COLUMN "exercise_intensity";--> statement-breakpoint
ALTER TABLE "complete_analyses" DROP COLUMN "integrative_analysis_id";--> statement-breakpoint
ALTER TABLE "complete_analyses" DROP COLUMN "nutrition_analysis_id";--> statement-breakpoint
ALTER TABLE "complete_analyses" DROP COLUMN "exercise_analysis_id";--> statement-breakpoint
ALTER TABLE "health_agents" ADD CONSTRAINT "health_agents_generator_key_unique" UNIQUE("generator_key");